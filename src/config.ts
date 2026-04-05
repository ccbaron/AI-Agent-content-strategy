import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash-lite"),
  GEMINI_EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-001"),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
  KNOWLEDGE_DIR: z.string().min(1).default("knowledge"),
  KNOWLEDGE_INDEX_PATH: z.string().min(1).default("data/knowledge-index.json"),
  PORT: z.coerce.number().default(3000),
});

const parsedEnv = envSchema.safeParse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  GEMINI_EMBEDDING_MODEL:
    process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  KNOWLEDGE_DIR: process.env.KNOWLEDGE_DIR || "knowledge",
  KNOWLEDGE_INDEX_PATH:
    process.env.KNOWLEDGE_INDEX_PATH || "data/knowledge-index.json",
  PORT: process.env.PORT || 3000,
});

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsedEnv.data;
