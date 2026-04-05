import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { config } from "../config.js";
import { chunkText } from "./chunker.js";
import { createEmbedding } from "./embeddings.js";
import type {
  IndexedKnowledgeChunk,
  SerializableKnowledgeIndex,
} from "./types.js";

export async function buildKnowledgeIndex(): Promise<SerializableKnowledgeIndex> {
  const baseDir = path.resolve(config.KNOWLEDGE_DIR);
  const filePaths = await fg(["**/*.md", "**/*.txt"], {
    cwd: baseDir,
    absolute: true,
  });

  const chunks: IndexedKnowledgeChunk[] = [];

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

  return {
    generatedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    chunks,
  };
}

export async function saveKnowledgeIndex(
  index: SerializableKnowledgeIndex,
): Promise<void> {
  const absoluteIndexPath = path.resolve(config.KNOWLEDGE_INDEX_PATH);
  const outputDir = path.dirname(absoluteIndexPath);

  await mkdir(outputDir, { recursive: true });
  await writeFile(absoluteIndexPath, JSON.stringify(index, null, 2), "utf-8");
}

export async function loadKnowledgeIndex(): Promise<SerializableKnowledgeIndex> {
  const absoluteIndexPath = path.resolve(config.KNOWLEDGE_INDEX_PATH);
  const rawContent = await readFile(absoluteIndexPath, "utf-8");
  return JSON.parse(rawContent) as SerializableKnowledgeIndex;
}
