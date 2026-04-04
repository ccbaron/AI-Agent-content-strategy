import { searchKnowledge } from "../rag/retriever.js";

export async function knowledgeSearch(query: string) {
  const results = await searchKnowledge(query, 3);

  return {
    query,
    results,
  };
}
