import OpenAI from "openai";
import { config } from "./config.js";
import { systemPrompt } from "./prompts.js";

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
    const input = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...this.conversationHistory,
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const response = await this.client.responses.create({
      model: config.OPENAI_MODEL,
      input,
    });

    const assistantMessage =
      response.output_text || "I could not generate a response.";

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
