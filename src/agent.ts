import OpenAI from "openai";
import { config } from "./config.js";
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

    const assistantMessage = finalText || "I could not generate a response.";

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
