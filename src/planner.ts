import OpenAI from "openai";
import { config } from "./config.js";

export type TaskType =
  | "research"
  | "comparison"
  | "ideation"
  | "rewrite"
  | "summarization"
  | "general";

export type TaskPlan = {
  taskType: TaskType;
  shouldResearch: boolean;
  responseGoal: string;
  outputFormat: "bullets" | "sections" | "table" | "short_paragraphs";
};

const planningSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    taskType: {
      type: "string",
      enum: [
        "research",
        "comparison",
        "ideation",
        "rewrite",
        "summarization",
        "general",
      ],
    },
    shouldResearch: {
      type: "boolean",
    },
    responseGoal: {
      type: "string",
    },
    outputFormat: {
      type: "string",
      enum: ["bullets", "sections", "table", "short_paragraphs"],
    },
  },
  required: ["taskType", "shouldResearch", "responseGoal", "outputFormat"],
} as const;

const plannerClient = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const fallbackPlan: TaskPlan = {
  taskType: "general",
  shouldResearch: false,
  responseGoal: "Answer the user clearly and helpfully.",
  outputFormat: "sections",
};

export async function createTaskPlan(userMessage: string): Promise<TaskPlan> {
  try {
    const response = await plannerClient.responses.create({
      model: config.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: `
You are a planning layer for a Content Intelligence Agent.

Analyze the user's request and return a JSON plan.
Choose whether the agent should research externally or answer directly.
Prefer research when the request involves:
- recent information
- competitors
- trends
- comparisons
- article-based analysis
- source-grounded recommendations

Return only the structured result.
          `.trim(),
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "task_plan",
          strict: true,
          schema: planningSchema,
        },
      },
    });

    if (!response.output_text) {
      return fallbackPlan;
    }

    const parsedPlan = JSON.parse(response.output_text) as TaskPlan;
    return parsedPlan;
  } catch {
    return fallbackPlan;
  }
}
