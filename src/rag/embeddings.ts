import OpenAI from "openai";
import { config } from "../config.js";

const embeddingClient = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await embeddingClient.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0]?.embedding || [];
}
