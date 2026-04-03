import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { config } from "./config.js";

const rl = readline.createInterface({ input, output });

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function getMockAgentResponse(userMessage: string): string {
  return `Mock agent response: I received your message -> "${userMessage}"`;
}

async function main(): Promise<void> {
  console.log("AI Agent CLI started.");
  console.log("Environment variables loaded correctly.");
  console.log(`API key detected: ${config.OPENAI_API_KEY.slice(0, 7)}...`);
  console.log('Type your message and press Enter. Type "exit" to quit.\n');

  while (true) {
    const userMessage = (await askQuestion("You: ")).trim();

    if (!userMessage) {
      console.log("Agent: Please enter a message.\n");
      continue;
    }

    if (userMessage.toLowerCase() === "exit") {
      console.log("Agent: Goodbye!");
      rl.close();
      break;
    }

    const agentResponse = getMockAgentResponse(userMessage);
    console.log(`Agent: ${agentResponse}\n`);
  }
}

main().catch((error) => {
  console.error("Unexpected application error:", error);
  rl.close();
  process.exit(1);
});
