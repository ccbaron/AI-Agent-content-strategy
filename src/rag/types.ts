export type KnowledgeChunk = {
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
