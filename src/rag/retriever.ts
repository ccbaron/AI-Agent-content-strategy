import { readFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { config } from "../config.js";
import { chunkText } from "./chunker.js";
import { createEmbedding } from "./embeddings.js";
import type { KnowledgeChunk, RetrievedChunk } from "./types.js";

let knowledgeIndex: KnowledgeChunk[] = [];
let isInitialized = false;

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

async function buildKnowledgeIndex(): Promise<void> {
  const baseDir = path.resolve(config.KNOWLEDGE_DIR);
  const filePaths = await fg(["**/*.md", "**/*.txt"], {
    cwd: baseDir,
    absolute: true,
  });

  const chunks: KnowledgeChunk[] = [];

  for (const filePath of filePaths) {
    const rawContent = await readFile(filePath, "utf-8");
    const textChunks = chunkText(rawContent);

    for (let index = 0; index < textChunks.length; index += 1) {
      const content = textChunks[index];
      const embedding = await createEmbedding(content);

      chunks.push({
        id: `${path.basename(filePath)}-${index}`,
        source: path.relative(process.cwd(), filePath),
        content,
        embedding,
      });
    }
  }

  knowledgeIndex = chunks;
  isInitialized = true;
}

export async function searchKnowledge(
  query: string,
  limit = 3,
): Promise<RetrievedChunk[]> {
  if (!isInitialized) {
    await buildKnowledgeIndex();
  }

  if (!knowledgeIndex.length) {
    return [];
  }

  const queryEmbedding = await createEmbedding(query);

  return knowledgeIndex
    .map((chunk) => ({
      source: chunk.source,
      content: chunk.content,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
