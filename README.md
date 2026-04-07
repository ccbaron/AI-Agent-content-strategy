# Content Intelligence Agent

A portfolio AI project for research-driven content strategy, brand analysis, and structured content ideation.

This project combines web research, internal knowledge retrieval, multi-step planning, response evaluation, and a lightweight chat UI. I built it to explore an AI workflow that feels closer to a real product than a basic chatbot demo.

## Why I built this

My background combines marketing, digital strategy, and full-stack development. I wanted to build a project that reflects that mix.

Instead of creating a generic chat app, I focused on an AI agent that can help with tasks such as:

- comparing competitor messaging
- extracting positioning angles
- generating content ideas grounded in research
- adapting outputs to a clearer brand or audience context

The goal was to build something that shows product thinking, structured backend logic, and practical AI integration in one project.

## What it does

The agent can:

- plan a response before generating it
- decide when to use tools
- search the web for recent or external information
- read a public URL and extract useful text
- retrieve relevant internal knowledge from a local indexed knowledge base
- evaluate and improve its own draft when needed
- stream responses to the frontend with status updates

## Main features

- **Tool-based workflow**  
  The agent can use web search, URL reading, and internal knowledge retrieval instead of answering everything directly.

- **Planning step**  
  A planner decides whether the request should be answered directly or whether tools should be used first.

- **Knowledge retrieval (RAG)**  
  Local markdown documents are indexed into a lightweight JSON knowledge store, then retrieved with cosine similarity.

- **Response evaluation**  
  In showcase mode, the agent can review and improve a draft before returning the final answer.

- **Conversation memory**  
  The app keeps a short rolling memory window to preserve context without growing unbounded.

- **SSE streaming frontend**  
  The UI shows progress updates, tool usage, and streaming text output in real time.

- **Configurable runtime modes**  
  The app supports a cost-saving mode and a showcase mode.

## Workflow

```text
User Message
      │
   Planner
      │
   Direct? ──── Yes ────────────────────► Generate Response
      │                                            │
      No                                           │
      │                                            │
   Tools / Knowledge Retrieval                     │
      │                                            │
   Draft Response                                  │
      │                                            ▼
   Evaluator (optional) ──────────────────► Final Response
                                                   │
                                             Stream to UI
```

## Example use cases

Here are a few example prompts that work well with this project:

1. Competitor positioning analysis

Compare the messaging of three project management tools and identify the strongest positioning angle for startup founders.

2. Content ideation grounded in context

Generate homepage headline options for an AI automation studio targeting B2B service companies.

3. Research + adaptation

Read this article, summarize the main ideas, and turn them into LinkedIn post angles for a brand with a confident but clear tone.

4. Internal knowledge usage

Based on the internal knowledge base, suggest a content strategy for a premium consulting brand focused on trust and clarity.

## How it works

At a high level, the request flow is:

1. The user sends a message from the UI or CLI.
2. The planner decides whether the request can be answered directly or whether tools should be used.
3. The agent optionally uses:
   - web search
   - URL reading
   - local knowledge retrieval
4. A draft response is generated.
5. If enabled, the evaluator reviews and improves the draft.
6. The final response is returned or streamed to the frontend.

## Tech stack
- Backend: TypeScript, Node.js, Express
- Frontend: HTML, CSS, vanilla TypeScript
- LLM: Gemini
- Web search: Tavily
- RAG: Local markdown ingestion + JSON knowledge index
- Streaming: Server-Sent Events (SSE)

## Project structure

```text
├── data/
│   └── knowledge-index.json
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── app.ts
│   │   ├── styles.css
│   │   ├── state.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── markdown.ts
│   └── tsconfig.json
├── knowledge/
│   ├── content_strategy.md
│   ├── ideal_customer_profile.md
│   ├── messaging_frameworks.md
│   └── positioning_principles.md
├── src/
│   ├── agent.ts
│   ├── cli.ts
│   ├── config.ts
│   ├── evaluator.ts
│   ├── planner.ts
│   ├── server.ts
│   ├── types.ts
│   ├── rag/
│   │   ├── embed.ts
│   │   ├── index.ts
│   │   ├── retrieve.ts
│   │   └── types.ts
│   ├── scripts/
│   │   └── build-knowledge-index.ts
│   ├── services/
│   │   ├── gemini.ts
│   │   └── tavily.ts
│   └── tools/
│       ├── index.ts
│       ├── read-url.ts
│       ├── retrieve-knowledge.ts
│       └── web-search.ts
├── README.md
├── DECISIONS.md
├── package.json
└── tsconfig.json
```

## Local setup

1. Install dependencies

npm install

2. Create your environment file

Copy .env.example to .env and add your keys:

GEMINI_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
APP_MODE=cost_saver
EVALUATOR_ENABLED=true
PORT=3000

3. Build the knowledge index

npm run knowledge:index


4. Start the web app

npm run web

Then open:

http://localhost:3000

## Available scripts

npm run build
npm run dev
npm run cli
npm run web
npm run knowledge:index


## Design choices

A short summary of the main technical decisions is available in DECISIONS.md

## Known limitations

This is still an MVP, so there are a few intentional limitations:

- the knowledge layer uses a lightweight local JSON index instead of a full vector database
- the frontend is intentionally minimal and focused on core interaction
- URL reading is simplified and only supports public http/https pages
- there is no authentication yet
- observability is still basic
- test coverage is not implemented yet


## What I would improve next

If I continued this project further, the next improvements would be:

- show source references more clearly in the UI
- add tests for planner, retrieval, and formatting utilities
- improve URL safety controls further
- add better response formatting and richer result cards
- add lightweight analytics and request tracing
- deploy the app and monitor real usage patterns

## Why this project matters in my portfolio

I built this project to show more than just API integration.

It reflects how I think about:

- product-oriented AI workflows
- practical backend architecture
- user-facing interaction design
- content and research use cases
- trade-offs between speed, cost, and quality

For me, the goal was not to build the most complex agent possible, but to build a clear and explainable one.