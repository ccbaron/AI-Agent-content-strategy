import OpenAI from "openai";
import { config } from "./config.js";
import { evaluateResponse } from "./evaluator.js";
import { createTaskPlan } from "./planner.js";
import { systemPrompt } from "./prompts.js";
import {
  executeToolCall,
  getFunctionCalls,
  toolDefinitions,
} from "./tools/index.js";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export class ContentIntelligenceAgent {
  private client: OpenAI;
  private conversationHistory: ConversationMessage[];

  constructor() {
    this.client = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });

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

    const input = [
      ...this.conversationHistory,
      {
        role: "user" as const,
        content: `${userMessage}

Planning context:
${planningContext}`,
      },
    ];

    const shouldEnableTools =
      taskPlan.shouldResearch ||
      taskPlan.taskType === "comparison" ||
      taskPlan.taskType === "research";

    const initialResponse = await this.client.responses.create({
      model: config.OPENAI_MODEL,
      instructions: systemPrompt,
      tools: shouldEnableTools ? toolDefinitions : [],
      input,
    });

    const functionCalls = getFunctionCalls(initialResponse.output || []);
    let finalText = initialResponse.output_text || "";

    if (functionCalls.length > 0) {
      const toolOutputs = await Promise.all(
        functionCalls.map((toolCall) => executeToolCall(toolCall)),
      );

      const finalResponse = await this.client.responses.create({
        model: config.OPENAI_MODEL,
        previous_response_id: initialResponse.id,
        input: toolOutputs,
      });

      finalText =
        finalResponse.output_text || "I could not generate a response.";
    }

    const evaluation = await evaluateResponse({
      userMessage,
      responseText: finalText,
      taskType: taskPlan.taskType,
      shouldResearch: taskPlan.shouldResearch,
    });

    let assistantMessage = finalText || "I could not generate a response.";

    if (evaluation.shouldRevise) {
      const revisionResponse = await this.client.responses.create({
        model: config.OPENAI_MODEL,
        instructions: systemPrompt,
        input: [
          {
            role: "user",
            content: `
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
      });

      assistantMessage = revisionResponse.output_text || assistantMessage;
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
