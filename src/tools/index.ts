import { Type } from "@google/genai";
import { searchKnowledge } from "../rag/retriever.js";
import { readUrl } from "./read-url.js";
import { webSearch } from "./web-search.js";

type StringArgumentSchema = {
  type: Type.STRING;
  description: string;
};

type FunctionDeclarationSchema = {
  name: string;
  description: string;
  parameters: {
    type: Type.OBJECT;
    properties: Record<string, StringArgumentSchema>;
    required: string[];
  };
};

export const functionDeclarations: FunctionDeclarationSchema[] = [
  {
    name: "web_search",
    description:
      "Search the web for recent information, articles, and source candidates related to content strategy, trends, comparisons, or market context.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "A focused web search query.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "read_url",
    description:
      "Read the content of a specific public URL to extract the main text for deeper analysis, summarization, or comparison.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: "A public URL to inspect.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "knowledge_search",
    description:
      "Search the internal knowledge base for relevant notes, documents, or strategic content context.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description:
            "A semantic search query for the internal knowledge base.",
        },
      },
      required: ["query"],
    },
  },
];

export async function executeFunctionCall(functionCall: {
  id?: string;
  name: string;
  args: Record<string, unknown>;
}) {
  switch (functionCall.name) {
    case "web_search": {
      const query = String(functionCall.args.query || "");
      const result = await webSearch(query);
      return { query, results: result.results };
    }

    case "read_url": {
      const url = String(functionCall.args.url || "");
      const result = await readUrl(url);
      return result;
    }

    case "knowledge_search": {
      const query = String(functionCall.args.query || "");
      const results = await searchKnowledge(query, 3);
      return { query, results };
    }

    default:
      throw new Error(`Unsupported function call: ${functionCall.name}`);
  }
}
