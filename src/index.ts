import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { config } from "./config.js";
import { ContentIntelligenceAgent } from "./agent.js";

const rl = readline.createInterface({ input, output });
const agent = new ContentIntelligenceAgent();

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function printWelcomeMessage(): void {
  console.log("Content Intelligence Agent CLI started.");
  console.log(`Model configured: ${config.OPENAI_MODEL}`);
  console.log("Research tools enabled: web_search, read_url");
  console.log("Type your message and press Enter.");
  console.log('Commands: "exit" to quit, "/clear" to reset memory.\n');
}

async function main(): Promise<void> {
  printWelcomeMessage();

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

    if (userMessage === "/clear") {
      agent.clearMemory();
      console.log("Agent: Conversation memory cleared.\n");
      continue;
    }

    try {
      console.log("Agent: Thinking...\n");
      const response = await agent.reply(userMessage);
      console.log(`Agent: ${response}\n`);
    } catch (error) {
      console.error("Agent: Failed to generate a response.");
      console.error(error);
      console.log("");
    }
  }
}

main().catch((error) => {
  console.error("Unexpected application error:", error);
  rl.close();
  process.exit(1);
});
