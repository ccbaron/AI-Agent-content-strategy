import { gemini } from "../gemini/client.js";
import { config } from "../config.js";

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await gemini.models.embedContent({
    model: config.GEMINI_EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });

  return response.embeddings?.[0]?.values || [];
}

export async function createQueryEmbedding(text: string): Promise<number[]> {
  const response = await gemini.models.embedContent({
    model: config.GEMINI_EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_QUERY",
    },
  });

  return response.embeddings?.[0]?.values || [];
}
