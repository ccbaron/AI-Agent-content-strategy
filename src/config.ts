import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === "true";
}

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash-lite"),
  GEMINI_EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-001"),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
  KNOWLEDGE_DIR: z.string().min(1).default("knowledge"),
  KNOWLEDGE_INDEX_PATH: z.string().min(1).default("data/knowledge-index.json"),
  PORT: z.coerce.number().int().positive().default(3000),

  APP_MODE: z.enum(["cost_saver", "showcase"]).default("cost_saver"),
  EVALUATOR_ENABLED: z.boolean().default(true),
  MAX_CONVERSATION_MESSAGES: z.coerce.number().int().positive().default(6),
  TAVILY_MAX_RESULTS: z.coerce.number().int().positive().default(3),
});

const parsedEnv = envSchema.safeParse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
  GEMINI_EMBEDDING_MODEL:
    process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001",
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  KNOWLEDGE_DIR: process.env.KNOWLEDGE_DIR ?? "knowledge",
  KNOWLEDGE_INDEX_PATH:
    process.env.KNOWLEDGE_INDEX_PATH ?? "data/knowledge-index.json",
  PORT: process.env.PORT ?? 3000,

  APP_MODE: process.env.APP_MODE ?? "cost_saver",
  EVALUATOR_ENABLED: parseBoolean(process.env.EVALUATOR_ENABLED, true),
  MAX_CONVERSATION_MESSAGES: process.env.MAX_CONVERSATION_MESSAGES ?? 6,
  TAVILY_MAX_RESULTS: process.env.TAVILY_MAX_RESULTS ?? 3,
});

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsedEnv.data;

export function logConfiguredServices(): void {
  console.log("Service configuration:");
  console.log(`- Gemini API key loaded: ${Boolean(config.GEMINI_API_KEY)}`);
  console.log(`- Tavily API key loaded: ${Boolean(config.TAVILY_API_KEY)}`);
  console.log(`- Gemini model: ${config.GEMINI_MODEL}`);
  console.log(`- Embedding model: ${config.GEMINI_EMBEDDING_MODEL}`);
  console.log(`- App mode: ${config.APP_MODE}`);
  console.log(`- Evaluator enabled: ${config.EVALUATOR_ENABLED}`);
}
