import cors from "cors";
import express from "express";
import { join } from "node:path";
import { ContentIntelligenceAgent } from "./agent.js";
import { config, logConfiguredServices } from "./config.js";

const app = express();
const agent = new ContentIntelligenceAgent();

const frontendDir = join(process.cwd(), "frontend");

app.use(cors());
app.use(express.json());
app.use(express.static(frontendDir));

function writeSseEvent(
  res: express.Response,
  event: string,
  data: unknown,
): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

app.get("/", (_req, res) => {
  res.sendFile(join(frontendDir, "index.html"));
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "content-intelligence-agent",
    model: config.GEMINI_MODEL,
    mode: config.APP_MODE,
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

app.get("/api/chat/stream", async (req, res) => {
  const message = String(req.query.message || "").trim();

  if (!message) {
    res.status(400).json({
      error: "Message is required.",
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  const keepAlive = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
    res.end();
  });

  try {
    await agent.replyWithEvents(message, async (event) => {
      switch (event.type) {
        case "status":
          writeSseEvent(res, "status", {
            phase: event.phase,
            message: event.message,
          });
          break;

        case "tool":
          writeSseEvent(res, "tool", {
            toolName: event.toolName,
          });
          break;

        case "chunk":
          writeSseEvent(res, "chunk", {
            text: event.text,
          });
          break;

        case "done":
          writeSseEvent(res, "done", {
            success: true,
          });
          break;
      }
    });
  } catch (error) {
    console.error("Streaming chat endpoint error:", error);

    writeSseEvent(res, "error", {
      message: "Failed to generate agent response.",
    });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
});

app.post("/api/reset", (_req, res) => {
  agent.clearMemory();

  res.json({
    success: true,
    message: "Conversation memory cleared.",
  });
});

logConfiguredServices();

app.listen(config.PORT, () => {
  console.log(`Web server running at http://localhost:${config.PORT}`);
});
