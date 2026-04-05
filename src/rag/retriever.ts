import { createQueryEmbedding } from "./embeddings.js";
import { loadKnowledgeIndex } from "./indexer.js";
import type { IndexedKnowledgeChunk, RetrievedChunk } from "./types.js";

let knowledgeIndex: IndexedKnowledgeChunk[] = [];
let isInitialized = false;

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dotProduct += a[index] * b[index];
    magnitudeA += a[index] * a[index];
    magnitudeB += b[index] * b[index];
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

async function initializeKnowledgeIndex(): Promise<void> {
  const loadedIndex = await loadKnowledgeIndex();
  knowledgeIndex = loadedIndex.chunks;
  isInitialized = true;
}

export async function searchKnowledge(
  query: string,
  limit = 3,
): Promise<RetrievedChunk[]> {
  if (!isInitialized) {
    await initializeKnowledgeIndex();
  }

  if (!knowledgeIndex.length) {
    return [];
  }

  const queryEmbedding = await createQueryEmbedding(query);

  return knowledgeIndex
    .map((chunk) => ({
      source: chunk.source,
      content: chunk.content,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
