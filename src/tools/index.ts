import type OpenAI from "openai";
import { readUrl } from "./read-url.js";
import { webSearch } from "./web-search.js";

export const toolDefinitions = [
  {
    type: "function",
    name: "web_search",
    description:
      "Search the web for recent information, articles, and source candidates related to content strategy, trends, comparisons, or market context.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A focused web search query.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "read_url",
    description:
      "Read the content of a specific public URL to extract the main text for deeper analysis, summarization, or comparison.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "A public URL to inspect.",
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    strict: true,
  },
] satisfies OpenAI.Responses.Tool[];

type FunctionCallItem = {
  type: "function_call";
  call_id: string;
  name: string;
  arguments: string;
};

export type FunctionToolCallOutput = {
  type: "function_call_output";
  call_id: string;
  output: string;
};

function isFunctionCallItem(item: unknown): item is FunctionCallItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  return (
    candidate.type === "function_call" &&
    typeof candidate.call_id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.arguments === "string"
  );
}

export function getFunctionCalls(output: unknown[]): FunctionCallItem[] {
  return output.filter(isFunctionCallItem);
}

export async function executeToolCall(
  toolCall: FunctionCallItem,
): Promise<FunctionToolCallOutput> {
  const parsedArguments = JSON.parse(toolCall.arguments) as Record<
    string,
    unknown
  >;

  switch (toolCall.name) {
    case "web_search": {
      const query = String(parsedArguments.query || "");
      const result = await webSearch(query);

      return {
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(result),
      };
    }

    case "read_url": {
      const url = String(parsedArguments.url || "");
      const result = await readUrl(url);

      return {
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(result),
      };
    }

    default:
      throw new Error(`Unsupported tool call: ${toolCall.name}`);
  }
}
