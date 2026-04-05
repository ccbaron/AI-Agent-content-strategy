import type { GenerateContentConfig } from "@google/genai";
import { gemini } from "./gemini/client.js";
import { config } from "./config.js";
import { evaluateResponse } from "./evaluator.js";
import { createTaskPlan } from "./planner.js";
import { systemPrompt } from "./prompts.js";
import { executeFunctionCall, functionDeclarations } from "./tools/index.js";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export class ContentIntelligenceAgent {
  private conversationHistory: ConversationMessage[];

  constructor() {
    this.conversationHistory = [];
  }

  async reply(userMessage: string): Promise<string> {
    const taskPlan = await createTaskPlan(userMessage);

    const planningContext = `
Task type: ${taskPlan.taskType}
Should research: ${taskPlan.shouldResearch}
Response goal: ${taskPlan.responseGoal}
Preferred output format: ${taskPlan.outputFormat}
    `.trim();

    const shouldEnableTools =
      taskPlan.shouldResearch ||
      taskPlan.taskType === "comparison" ||
      taskPlan.taskType === "research";

    const contents: Array<{
      role: "user" | "model";
      parts: Array<Record<string, unknown>>;
    }> = [
      ...this.conversationHistory.map((message) => ({
        role:
          message.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: message.content }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}

User request:
${userMessage}

Planning context:
${planningContext}`,
          },
        ],
      },
    ];

    const generationConfig: GenerateContentConfig | undefined =
      shouldEnableTools
        ? {
            tools: [{ functionDeclarations }],
          }
        : undefined;

    let finalText = "";

    while (true) {
      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents,
        config: generationConfig,
      });

      const functionCalls = response.functionCalls ?? [];

      if (functionCalls.length > 0) {
        const functionCall = functionCalls[0];

        if (!functionCall.name) {
          throw new Error("Gemini returned a function call without a name.");
        }

        const toolResult = await executeFunctionCall({
          id: functionCall.id,
          name: functionCall.name,
          args: functionCall.args ?? {},
        });

        contents.push({
          role: "model",
          parts: [{ functionCall }],
        });

        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: functionCall.name,
                response: { result: toolResult },
                id: functionCall.id,
              },
            },
          ],
        });

        continue;
      }

      finalText = response.text || "I could not generate a response.";
      break;
    }

    const evaluation = await evaluateResponse({
      userMessage,
      responseText: finalText,
      taskType: taskPlan.taskType,
      shouldResearch: taskPlan.shouldResearch,
    });

    let assistantMessage = finalText;

    if (evaluation.shouldRevise) {
      const revisionResponse = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
${systemPrompt}

Original user request:
${userMessage}

Initial response:
${assistantMessage}

Revision reason:
${evaluation.revisionReason}

Known weaknesses:
${evaluation.weaknesses.join("; ")}

Please produce a stronger final answer that better satisfies the request.
                `.trim(),
              },
            ],
          },
        ],
      });

      assistantMessage = revisionResponse.text || assistantMessage;
    }

    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  }

  clearMemory(): void {
    this.conversationHistory = [];
  }
}
