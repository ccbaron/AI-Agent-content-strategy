import 'dotenv/config'
import { buildKnowledgeIndex, saveKnowledgeIndex } from "../rag/indexer.js";

async function main(): Promise<void> {
  console.log("Building knowledge index...");

  const index = await buildKnowledgeIndex();
  await saveKnowledgeIndex(index);

  console.log("Knowledge index generated successfully.");
  console.log(`Chunks indexed: ${index.chunkCount}`);
  console.log(`Generated at: ${index.generatedAt}`);
}

main().catch((error) => {
  console.error("Failed to build knowledge index:", error);
  process.exit(1);
});
