import cors from "cors";
import express from "express";
import { join } from "node:path";
import { ContentIntelligenceAgent } from "./agent.js";
import { config } from "./config.js";

const app = express();
const agent = new ContentIntelligenceAgent();

const frontendDir = join(process.cwd(), "frontend");

app.use(cors());
app.use(express.json());
app.use(express.static(frontendDir));

app.get("/", (_req, res) => {
  res.sendFile(join(frontendDir, "index.html"));
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "content-intelligence-agent",
    model: config.OPENAI_MODEL,
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      res.status(400).json({
        error: "Message is required.",
      });
      return;
    }

    const response = await agent.reply(message);

    res.json({
      message: response,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);

    res.status(500).json({
      error: "Failed to generate agent response.",
    });
  }
});

app.post("/api/reset", (_req, res) => {
  agent.clearMemory();

  res.json({
    success: true,
    message: "Conversation memory cleared.",
  });
});

app.listen(config.PORT, () => {
  console.log(`Web server running at http://localhost:${config.PORT}`);
});
