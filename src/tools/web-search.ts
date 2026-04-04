import { tavily } from "@tavily/core";
import { config } from "../config.js";

const tavilyClient = tavily({
  apiKey: config.TAVILY_API_KEY,
});

type TavilySearchResult = {
  title?: string;
  url?: string;
  content?: string;
};

export async function webSearch(query: string) {
  const response = await tavilyClient.search(query);

  const normalizedResults = (
    (response.results as TavilySearchResult[] | undefined) || []
  )
    .slice(0, 5)
    .map((result) => ({
      title: result.title || "Untitled source",
      url: result.url || "",
      snippet: result.content || "",
    }));

  return {
    query,
    results: normalizedResults,
  };
}
