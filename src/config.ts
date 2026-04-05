import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string().min(1).default("gpt-5-nano"),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
  KNOWLEDGE_DIR: z.string().min(1).default("knowledge"),
  KNOWLEDGE_INDEX_PATH: z.string().min(1).default("data/knowledge-index.json"),
});

const parsedEnv = envSchema.safeParse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-5-nano",
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  KNOWLEDGE_DIR: process.env.KNOWLEDGE_DIR || "knowledge",
  KNOWLEDGE_INDEX_PATH:
    process.env.KNOWLEDGE_INDEX_PATH || "data/knowledge-index.json",
});

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsedEnv.data;
