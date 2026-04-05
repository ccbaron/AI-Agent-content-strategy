import { gemini } from "./gemini/client.js";
import { config } from "./config.js";
import { getPlannerGenerationConfig } from "./gemini/generation-config.js";

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

const fallbackPlan: TaskPlan = {
  taskType: "general",
  shouldResearch: false,
  responseGoal: "Answer the user clearly and helpfully.",
  outputFormat: "sections",
};

export async function createTaskPlan(userMessage: string): Promise<TaskPlan> {
  try {
    const response = await gemini.models.generateContent({
      model: config.GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
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

User request:
${userMessage}
              `.trim(),
            },
          ],
        },
      ],
      config: {
        ...getPlannerGenerationConfig(),
        responseMimeType: "application/json",
        responseJsonSchema: planningSchema,
      },
    });

    if (!response.text) {
      return fallbackPlan;
    }

    return JSON.parse(response.text) as TaskPlan;
  } catch {
    return fallbackPlan;
  }
}
