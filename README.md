# Content Intelligence Agent

> An AI-powered agent that combines **web research**, **internal knowledge retrieval (RAG)**, **multi-step planning**, and **self-evaluation** to deliver strategic content decisions — not just text generation.

```
                                  User Input
                                      │
                    ┌─────────────────┴───────────────────┐
                    │          Planning Layer             │
                    │                                     │
                    │  · Classifies intent                │
                    │  · Selects task type                │
                    │    (research / comparison /         │
                    │     ideation / rewrite / summary)   │
                    │  · Decides if research is needed    │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────┴────────────────────────┐
                    │      Generation Layer                    │
                    │      Gemini + Function Calling           │
                    │                                          │
                    │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐
                    │  │ Web       │  │ URL       │  │ Knowledge Search  │
                    │  │ Search    │  │ Reader    │  │                   │
                    │  │ (Tavily)  │  │ (fetch)   │  │ RAG + Embeddings  │
                    │  └───────────┘  └───────────┘  └───────────────────┘
                    │                                          │
                    │  Gemini selects tools autonomously       │
                    │  and loops until no calls remain         │
                    └─────────────────┬────────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────┐
                    │         Evaluation Layer            │
                    │                                     │
                    │  · Checks alignment to request      │
                    │  · Checks clarity and depth         │
                    │  · Checks evidence usage            │
                    │  · Triggers revision if needed      │
                    └─────────────────┬───────────────────┘
                                      │
                               ┌──────┴──────┐
                               │  pass       │  revise
                               │             └──────────────────┐
                               ▼                                ▼
                    ┌─────────────────┐             ┌──────────────────────┐
                    │    Response     │             │  Revision Loop       │
                    │                 │             │  Re-generates with   │
                    │  Streamed via   │◄────────────│  evaluator feedback  │
                    │  SSE (Web UI)   │             └──────────────────────┘
                    │  or CLI output  │
                    └─────────────────┘
```

---

## What Makes This Different

| Feature | Generic LLM Chat | This Agent |
|---|---|---|
| Task planning before generation | ❌ | ✅ Classifies intent, selects strategy |
| Live web research | ❌ | ✅ Tavily API integration |
| Internal knowledge base (RAG) | ❌ | ✅ Semantic search with embeddings |
| Self-evaluation & revision | ❌ | ✅ Quality gate before responding |
| Conversation memory | Basic | ✅ Configurable rolling window |
| Structured output formats | ❌ | ✅ Bullets, tables, sections, paragraphs |

---

## Capabilities

| Task Type | What It Does |
|---|---|
| **Research** | Searches the web for trends, news, and data, then synthesizes findings |
| **Comparison** | Contrasts options with structured analysis and implications |
| **Ideation** | Generates content ideas with strategic variety |
| **Rewrite** | Improves existing copy aligned to audience and goals |
| **Summarization** | Condenses sources into concise key takeaways |
| **General Q&A** | Answers questions using knowledge base and/or web |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (ES2022, ESM) |
| LLM | Google Gemini (`gemini-2.5-flash-lite`) |
| Embeddings | Gemini Embedding API (`gemini-embedding-001`) |
| Web Search | Tavily API |
| Backend | Express.js 5 |
| Frontend | Vanilla JS + HTML/CSS (dark theme) |
| Validation | Zod |
| RAG Storage | JSON-based vector index |

---

## Architecture

```
src/
├── agent.ts                 # Core agent: plan → generate → evaluate → revise
├── planner.ts               # Task classification and strategy selection
├── evaluator.ts             # Response quality gate
├── prompts.ts               # System prompt definition
├── config.ts                # Zod-validated environment config
├── server.ts                # Express server with SSE streaming
├── index.ts                 # CLI entry point
├── gemini/
│   ├── client.ts            # Gemini API client (singleton)
│   └── generation-config.ts # Token budgets, tool configs, JSON schemas
├── rag/
│   ├── chunker.ts           # Text chunking for knowledge docs
│   ├── embeddings.ts        # Vector embedding generation
│   ├── indexer.ts           # Build & persist knowledge index
│   ├── retriever.ts         # Cosine similarity search
│   └── types.ts             # Shared RAG type definitions
├── tools/
│   ├── index.ts             # Tool declarations + router
│   ├── web-search.ts        # Tavily web search
│   ├── read-url.ts          # URL content extraction
│   └── knowledge-search.ts  # RAG-powered knowledge lookup
└── scripts/
    └── build-knowledge-index.ts  # Pre-build embedding index
```

---

## Agent Workflow

1. **Plan** — The planner classifies the user's intent (research, comparison, ideation, rewrite, summarization, general) and determines whether external research is needed.

2. **Generate** — Gemini produces a response using function calling. The model autonomously decides when to invoke tools:
   - `web_search` — live web results via Tavily
   - `read_url` — extract and parse content from a URL
   - `knowledge_search` — semantic search over internal documents (audiences, style guide, competitor notes, content strategy)

3. **Evaluate** — An evaluation layer checks alignment, clarity, evidence usage, and depth. If the response falls short, it triggers a revision cycle with specific feedback.

4. **Respond** — The final response is streamed to the frontend via Server-Sent Events (SSE) with real-time status updates showing each phase.

---

## RAG Pipeline

The agent includes a lightweight Retrieval-Augmented Generation pipeline:

1. **Index** — Markdown files in `knowledge/` are chunked and embedded using Gemini's embedding model
2. **Store** — Vectors are persisted in `data/knowledge-index.json`
3. **Retrieve** — Queries are embedded and matched via cosine similarity against the index
4. **Augment** — Top results are injected into the generation context

**Knowledge base includes:**
- Target audience profiles (startup founders, marketing teams, product teams)
- Brand voice & style guide
- Competitor analysis notes
- Content strategy for 2026

---

## Running Modes

| Mode | Tokens | Extended Thinking | Use Case |
|---|---|---|---|
| `cost_saver` | 700 max | Disabled | Development, testing |
| `showcase` | 1800 max | 256 budget | Demos, production quality |

---

## Setup

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)
- A [Tavily API key](https://tavily.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/AI-Agent-content-strategy.git
cd AI-Agent-content-strategy

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

```env
GEMINI_API_KEY=your-gemini-key        # Required
TAVILY_API_KEY=your-tavily-key        # Required
GEMINI_MODEL=gemini-2.5-flash-lite    # Optional (default)
APP_MODE=cost_saver                   # cost_saver | showcase
EVALUATOR_ENABLED=true                # Enable quality evaluation
PORT=3000                             # Server port
```

### Build the Knowledge Index

```bash
npm run knowledge:index
```

### Run

```bash
# Web UI (recommended)
npm run web
# → Open http://localhost:3000

# CLI mode
npm run dev

# Production build
npm run build && npm start
```

---

## Interfaces

### Web UI

A dark-themed chat interface with:
- Real-time response streaming (SSE)
- Status indicators for each agent phase (planning, searching, evaluating...)
- Tool usage logging
- Sample prompts to get started
- Conversation memory with reset option

### CLI

Interactive terminal chat with streaming output, `/clear` command, and the same agent capabilities.

### API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check with model & mode info |
| `POST` | `/api/chat` | Single response (JSON) |
| `GET` | `/api/chat/stream?message=...` | Streaming response (SSE) |
| `POST` | `/api/reset` | Clear conversation memory |

---

## License

MIT

To build the local knowledge index:

````bash
npm run knowledge:index

```bash
npm install
````
