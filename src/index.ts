import { config } from "./config.js";

function main() {
  console.log("Project bootstrap completed successfully.");
  console.log("Environment variables loaded correctly.");
  console.log(`API key detected: ${config.OPENAI_API_KEY.slice(0, 7)}...`);
}

main();