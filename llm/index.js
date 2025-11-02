import express from "express";
import axios from "axios";
import OpenAI from "openai";

// ---- Config ----
const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL || "qwen3:14b";
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://0.0.0.0:8080";

const oa = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "http://127.0.0.1:11434/v1",
  apiKey: process.env.OPENAI_API_KEY || "sk-local-123",
});

// ---- App + JSON ----
const app = express();
app.use(express.json());

// ---- Logger ----
const log = {
  info: (...args) => console.log("[INFO]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

// ---- Tool Schemas (OpenAI) ----
// Define tools here; add more entries as you create FastAPI endpoints.
const AVAILABLE_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_questions",
      description: "Search the knowledge base for relevant questions",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for the knowledge base" },
          limit: { type: "integer", description: "Max number of results", default: 5 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_answers",
      description: "Get answers for a specific question ID from the knowledge base",
      parameters: {
        type: "object",
        properties: {
          question_id: { type: "string", description: "The KB question ID" },
        },
        required: ["question_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_datetime",
      description: "Get the current date and time from the MCP",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "summarize_thread",
      description: "Summarize a question thread by question ID",
      parameters: {
        type: "object",
        properties: {
          question_id: { type: "string", description: "The thread/question ID" },
        },
        required: ["question_id"],
      },
    },
  },
  // --- Extra MCP tools already in your FastAPI ---
  {
    type: "function",
    function: {
      name: "get_details",
      description: "Get detailed KB questions filtered by tags",
      parameters: {
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: { type: "string" },
            description: "List of tags to filter questions by",
          },
        },
        required: ["tags"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "process_ticket",
      description:
        "End-to-end ticket helper: search KB, pull answers, and draft response sections",
      parameters: {
        type: "object",
        properties: {
          ticket_text: { type: "string", description: "Full client ticket text" },
          top_k: { type: "integer", description: "How many KB hits to retrieve", default: 3 },
        },
        required: ["ticket_text"],
      },
    },
  },
];

// ---- Tool Handlers (maps tool name -> FastAPI call) ----
// Each entry returns { data } from the Axios request; errors are thrown upward.
const TOOL_HANDLERS = {
  async search_questions(args) {
    return axios.post(`${FASTAPI_BASE_URL}/tool/search_questions`, {
      query: args.query,
      limit: args.limit ?? 5,
    });
  },

  async get_answers(args) {
    return axios.post(`${FASTAPI_BASE_URL}/tool/get_answers`, {
      question_id: args.question_id,
    });
  },

  async get_datetime() {
    return axios.get(`${FASTAPI_BASE_URL}/tool/datetime`);
  },

  async summarize_thread(args) {
    // Your FastAPI expects the question_id in the URL
    return axios.post(`${FASTAPI_BASE_URL}/tool/summarize_thread/${args.question_id}`);
  },

  async get_details(args) {
    return axios.post(`${FASTAPI_BASE_URL}/tool/get_details`, {
      tags: args.tags,
    });
  },

  async process_ticket(args) {
    return axios.post(`${FASTAPI_BASE_URL}/process_ticket`, {
      ticket_text: args.ticket_text,
      top_k: args.top_k ?? 3,
    });
  },
};

// ---- Helpers ----
function prettyToolList() {
  return AVAILABLE_TOOLS.map((t) => t.function?.name).filter(Boolean).join(", ");
}

async function callFastAPITool(toolName, args) {
  const handler = TOOL_HANDLERS[toolName];
  if (!handler) throw new Error(`Unknown tool: ${toolName}`);

  try {
    const response = await handler(args || {});
    return response.data;
  } catch (error) {
    // surface a clean error back to the model
    const msg =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      String(error);
    log.error(`Tool "${toolName}" failed:`, msg);
    throw new Error(msg);
  }
}

// ---- Routes ----

// Health check: also confirms FastAPI is reachable.
app.get("/health", async (_req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}/tool/datetime`);
    res.json({
      status: "ok",
      fastapi_server: "connected",
      test_response: response.data,
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      fastapi_server: "disconnected",
      error: error?.message || String(error),
    });
  }
});

// List the OpenAI tool schemas currently enabled
app.get("/tools", (_req, res) => {
  res.json({
    tools: AVAILABLE_TOOLS.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    })),
  });
});

// Direct proxy to your FastAPI "process_ticket" if you want to call it without LLM
app.post("/process_ticket", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/process_ticket`, req.body);
    res.json(response.data);
  } catch (error) {
    log.error("Error calling process_ticket:", error?.message || String(error));
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Chat: send a message list to the model and allow it to call tools automatically.
app.post("/chat", async (req, res) => {
  try {
    const { messages = [], model = MODEL } = req.body;

    log.info(`Tools available to model: ${prettyToolList()}`);

    // 1) Let the model decide if it wants to call tools
    const first = await oa.chat.completions.create({
      model,
      messages,
      tools: AVAILABLE_TOOLS,
      tool_choice: "auto",
    });

    const msg = first.choices?.[0]?.message;

    // 2) If tool calls are requested, fulfill them
    if (msg?.tool_calls?.length) {
      const toolMessages = [msg];

      for (const tc of msg.tool_calls) {
        const toolName = tc.function.name;
        const toolArgs = safeJSON(tc.function.arguments);

        log.info(`Calling tool "${toolName}" with:`, toolArgs);

        try {
          const toolResult = await callFastAPITool(toolName, toolArgs);
          toolMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult),
          });
        } catch (err) {
          toolMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify({ error: err.message }),
          });
        }
      }

      // 3) Return results to the model for a final natural language answer
      const second = await oa.chat.completions.create({
        model,
        messages: [...messages, ...toolMessages],
      });

      return res.json(second);
    }

    // No tool call; return the model's first reply
    return res.json(first);
  } catch (err) {
    log.error("Chat error:", err?.message || String(err));
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// ---- Utils ----
function safeJSON(s) {
  if (!s) return {};
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

// ---- Start server ----
app.listen(PORT, () => {
  log.info(`Server running at http://localhost:${PORT}`);
  log.info(`Model: ${MODEL}`);
  log.info(`FastAPI MCP at: ${FASTAPI_BASE_URL}`);
  log.info(`Tools: ${prettyToolList()}`);
});

