import type { GenerateContentConfig } from "@google/genai";
import { config } from "../config.js";
import { functionDeclarations } from "../tools/index.js";

function getModeSettings() {
  if (config.APP_MODE === "showcase") {
    return {
      maxOutputTokens: 1800,
      thinkingBudget: 256,
      plannerMaxOutputTokens: 250,
      evaluatorMaxOutputTokens: 300,
    };
  }

  return {
    maxOutputTokens: 700,
    thinkingBudget: 0,
    plannerMaxOutputTokens: 180,
    evaluatorMaxOutputTokens: 220,
  };
}

export function getBaseGenerationConfig(): GenerateContentConfig {
  const settings = getModeSettings();

  return {
    maxOutputTokens: settings.maxOutputTokens,
    thinkingConfig: {
      thinkingBudget: settings.thinkingBudget,
    },
  };
}

export function getToolEnabledGenerationConfig(): GenerateContentConfig {
  return {
    ...getBaseGenerationConfig(),
    tools: [{ functionDeclarations }],
  };
}

export function getPlannerGenerationConfig(): GenerateContentConfig {
  const settings = getModeSettings();

  return {
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: "object",
      additionalProperties: true,
    },
    maxOutputTokens: settings.plannerMaxOutputTokens,
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };
}

export function getEvaluatorGenerationConfig(): GenerateContentConfig {
  const settings = getModeSettings();

  return {
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: "object",
      additionalProperties: true,
    },
    maxOutputTokens: settings.evaluatorMaxOutputTokens,
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };
}
