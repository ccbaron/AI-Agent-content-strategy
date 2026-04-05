import OpenAI from "openai";
import { config } from "./config.js";

export type EvaluationResult = {
  shouldRevise: boolean;
  revisionReason: string;
  strengths: string[];
  weaknesses: string[];
};

const evaluatorClient = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const evaluationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    shouldRevise: {
      type: "boolean",
    },
    revisionReason: {
      type: "string",
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["shouldRevise", "revisionReason", "strengths", "weaknesses"],
} as const;

const fallbackEvaluation: EvaluationResult = {
  shouldRevise: false,
  revisionReason: "",
  strengths: [],
  weaknesses: [],
};

export async function evaluateResponse(args: {
  userMessage: string;
  responseText: string;
  taskType: string;
  shouldResearch: boolean;
}): Promise<EvaluationResult> {
  try {
    const response = await evaluatorClient.responses.create({
      model: config.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: `
You evaluate responses produced by a Content Intelligence Agent.

Your task is to judge whether the answer should be revised before being shown to the user.

Revise only if there is a meaningful issue such as:
- weak alignment with the user's request
- poor clarity
- shallow structure
- missing grounding when research was expected
- vague or generic output when a more strategic answer was needed

Do not request revision for minor stylistic preferences.
Return only the structured result.
          `.trim(),
        },
        {
          role: "user",
          content: `
User request:
${args.userMessage}

Task type:
${args.taskType}

Research expected:
${args.shouldResearch}

Draft response:
${args.responseText}
          `.trim(),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "evaluation_result",
          strict: true,
          schema: evaluationSchema,
        },
      },
    });

    if (!response.output_text) {
      return fallbackEvaluation;
    }

    return JSON.parse(response.output_text) as EvaluationResult;
  } catch {
    return fallbackEvaluation;
  }
}
