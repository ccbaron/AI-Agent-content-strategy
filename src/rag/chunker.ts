export function chunkText(text: string, chunkSize = 800): string[] {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (!normalizedText) {
    return [];
  }

  const chunks: string[] = [];

  for (let i = 0; i < normalizedText.length; i += chunkSize) {
    chunks.push(normalizedText.slice(i, i + chunkSize));
  }

  return chunks;
}
