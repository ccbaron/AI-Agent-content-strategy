export type IndexedKnowledgeChunk = {
  id: string;
  source: string;
  content: string;
  embedding: number[];
};

export type RetrievedChunk = {
  source: string;
  content: string;
  score: number;
};

export type SerializableKnowledgeIndex = {
  generatedAt: string;
  chunkCount: number;
  chunks: IndexedKnowledgeChunk[];
};
