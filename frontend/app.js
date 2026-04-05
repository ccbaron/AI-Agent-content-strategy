const messagesEl = document.getElementById("messages");
const welcomeEl = document.getElementById("welcome");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const resetButton = document.getElementById("resetButton");

let isGenerating = false;

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function scrollToBottom() {
  const chat = document.getElementById("chat");
  chat.scrollTop = chat.scrollHeight;
}

function autoResizeTextarea() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 160)}px`;
}

function addUserBubble(text) {
  const el = document.createElement("div");
  el.className = "message user";
  el.innerHTML = `
    <div class="bubble">${escapeHtml(text)}</div>
  `;

  messagesEl.appendChild(el);
  scrollToBottom();
}

function createAgentContainer() {
  const el = document.createElement("div");
  el.className = "message agent";
  el.innerHTML = `
    <div class="agent-content">
      <div class="status">
        <span class="dots"><span></span></span>
        <span class="status-text">Thinking...</span>
      </div>
      <div class="text-content" style="display: none;"></div>
    </div>
  `;

  messagesEl.appendChild(el);
  scrollToBottom();
  return el;
}

function showAgentMessage(container, text) {
  const statusEl = container.querySelector(".status");
  const textEl = container.querySelector(".text-content");

  statusEl.style.display = "none";
  textEl.style.display = "block";
  textEl.innerHTML = renderBasicMarkdown(text);

  scrollToBottom();
}

function showError(container, message) {
  const statusEl = container.querySelector(".status");
  const textEl = container.querySelector(".text-content");

  statusEl.style.display = "none";
  textEl.style.display = "block";
  textEl.innerHTML = `<p class="error-text">Error: ${escapeHtml(message)}</p>`;

  scrollToBottom();
}

function renderBasicMarkdown(text) {
  let html = escapeHtml(text);

  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/^\- (.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;

  return html;
}

function setLoadingState(isLoading) {
  isGenerating = isLoading;
  sendButton.disabled = isLoading;
  messageInput.disabled = isLoading;
}

async function sendMessage(text) {
  if (!text || isGenerating) return;

  welcomeEl.style.display = "none";
  addUserBubble(text);

  messageInput.value = "";
  autoResizeTextarea();
  setLoadingState(true);

  const agentContainer = createAgentContainer();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    showAgentMessage(agentContainer, data.message);
  } catch (error) {
    showError(agentContainer, error.message || "Unexpected error.");
  } finally {
    setLoadingState(false);
    messageInput.focus();
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  await sendMessage(text);
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

messageInput.addEventListener("input", autoResizeTextarea);

document.addEventListener("click", async (event) => {
  const suggestion = event.target.closest("[data-suggestion]");
  if (!suggestion) return;

  const text = suggestion.textContent.trim();
  await sendMessage(text);
});

resetButton.addEventListener("click", async () => {
  try {
    await fetch("/api/reset", {
      method: "POST",
    });

    messagesEl.innerHTML = "";
    welcomeEl.style.display = "flex";
    messageInput.focus();
  } catch (error) {
    console.error("Reset error:", error);
  }
});
