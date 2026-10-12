import { initializeKotomiApp } from "/js/kotomi.js";

initializeKotomiApp("chat");

const elements = {
    newChatButton: document.getElementById("newChatButton"),
    conversationList: document.getElementById("conversationList"),
    settingsButton: document.getElementById("settingsButton"),
    chatTitle: document.getElementById("chatTitle"),
    chatModelLabel: document.getElementById("chatModelLabel"),
    deleteChatButton: document.getElementById("deleteChatButton"),
    messageList: document.getElementById("messageList"),
    emptyState: document.getElementById("emptyState"),
    messageForm: document.getElementById("messageForm"),
    messageInput: document.getElementById("messageInput"),
    sendButton: document.getElementById("sendButton"),
    chatStatus: document.getElementById("chatStatus"),
    settingsOverlay: document.getElementById("settingsOverlay"),
    closeSettingsButton: document.getElementById("closeSettingsButton"),
    cancelSettingsButton: document.getElementById("cancelSettingsButton"),
    settingsForm: document.getElementById("settingsForm"),
    modelSelect: document.getElementById("modelSelect"),
    contextWindow: document.getElementById("contextWindow"),
    temperature: document.getElementById("temperature"),
    temperatureValue: document.getElementById("temperatureValue"),
    settingsStatus: document.getElementById("settingsStatus"),
    saveSettingsButton: document.getElementById("saveSettingsButton"),
    contextUsageText: document.getElementById("contextUsageText"),
    contextUsageBar: document.getElementById("contextUsageBar"),
    contextUsageFill: document.getElementById("contextUsageFill"),
};

const state = {
    conversations: [],
    conversationId: null,
    models: [],
    settings: {
        DefaultModel: null,
        ContextWindow: 8192,
        Temperature: 0.7,
    },
    isStreaming: false,
    abortController: null,
};

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const data = await response.json();
            message = data.error || data.message || message;
        } catch {
            // The response did not contain JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function setChatStatus(message) {
    elements.chatStatus.textContent = message;
}

function setSettingsStatus(message) {
    elements.settingsStatus.textContent = message;
}

function setStreaming(isStreaming) {
    state.isStreaming = isStreaming;
    elements.messageInput.disabled = isStreaming;
    elements.newChatButton.disabled = isStreaming;
    elements.deleteChatButton.disabled = isStreaming || state.conversationId === null;
    elements.settingsButton.disabled = isStreaming;
    elements.sendButton.disabled = false;
    elements.sendButton.textContent = isStreaming ? "Stop" : "Send";
}

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return isToday
        ? date.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
          })
        : date.toLocaleDateString([], {
              month: "short",
              day: "numeric",
          });
}

function renderConversations() {
    elements.conversationList.replaceChildren();

    if (state.conversations.length === 0) {
        const empty = document.createElement("p");
        empty.className = "conversation-list-empty";
        empty.textContent = "No conversations yet.";
        elements.conversationList.append(empty);
        return;
    }

    for (const conversation of state.conversations) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "conversation-item";

        if (conversation.ConversationID === state.conversationId) {
            item.classList.add("active");
        }

        const title = document.createElement("span");
        title.className = "conversation-item-title";
        title.textContent = conversation.Title || "New Chat";

        const date = document.createElement("span");
        date.className = "conversation-item-date";
        date.textContent = formatDate(conversation.UpdatedDate);

        item.append(title, date);
        item.addEventListener("click", () => {
            openConversation(conversation.ConversationID);
        });

        elements.conversationList.append(item);
    }
}

function renderAssistantMarkdown(element, content) {
    const html = marked.parse(content, {
        gfm: true,
    });

    element.innerHTML = DOMPurify.sanitize(html);

    renderMathInElement(element, {
        delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
    });
}

function createMessageElement(role, content = "") {
    const message = document.createElement("article");
    message.className = `chat-message ${role}-message`;

    const label = document.createElement("div");
    label.className = "chat-message-label";
    label.textContent = role === "user" ? "You" : "Assistant";

    const body = document.createElement("div");
    body.className = "chat-message-content";

    if (role === "assistant" && content) {
        renderAssistantMarkdown(body, content);
    } else {
        body.textContent = content;
    }

    message.append(label, body);
    elements.messageList.append(message);

    elements.emptyState.classList.add("hide");
    elements.messageList.scrollTop = elements.messageList.scrollHeight;

    return { message, body };
}

function renderMessages(messages) {
    elements.messageList.replaceChildren();

    if (messages.length === 0) {
        elements.messageList.append(elements.emptyState);
        elements.emptyState.classList.remove("hide");
        return;
    }

    elements.emptyState.classList.add("hide");

    for (const message of messages) {
        createMessageElement(message.Role, message.Content);
    }

    elements.messageList.scrollTop = elements.messageList.scrollHeight;
}

function updateChatHeader(conversation) {
    elements.chatTitle.textContent = conversation?.Title || "New Chat";
    elements.chatModelLabel.textContent =
        conversation?.Model || state.settings.DefaultModel || "No model selected";
    elements.deleteChatButton.disabled = state.isStreaming || !conversation;
}

async function loadConversations() {
    state.conversations = await apiRequest("/api/chat/conversations");
    renderConversations();
}

async function loadSettings() {
    const [models, settings] = await Promise.all([
        apiRequest("/api/ai/models"),
        apiRequest("/api/chat/settings"),
    ]);

    state.models = models;
    state.settings = settings;

    elements.modelSelect.replaceChildren();

    const automaticOption = document.createElement("option");
    automaticOption.value = "";
    automaticOption.textContent = models.length
        ? "Automatically select a model"
        : "No models available";
    elements.modelSelect.append(automaticOption);

    for (const model of models) {
        const option = document.createElement("option");
        option.value = model.name;
        option.textContent = model.name;
        elements.modelSelect.append(option);
    }

    elements.modelSelect.value = settings.DefaultModel || "";
    elements.contextWindow.value = settings.ContextWindow;
    elements.temperature.value = settings.Temperature;
    elements.temperatureValue.textContent = settings.Temperature.toFixed(1);
}

async function openConversation(conversationId) {
    if (state.isStreaming) return;

    try {
        const conversation = await apiRequest(`/api/chat/conversations/${conversationId}`);

        state.conversationId = conversation.ConversationID;

        renderMessages(conversation.messages);
        updateChatHeader(conversation);
        renderConversations();
        setChatStatus("");
    } catch (error) {
        setChatStatus(error.message);
    }
}

async function createConversation() {
    if (state.isStreaming) return;

    try {
        const result = await apiRequest("/api/chat/conversations", {
            method: "POST",
            body: JSON.stringify({
                model: state.settings.DefaultModel || null,
            }),
        });

        await loadConversations();
        await openConversation(result.conversationId);
        elements.messageInput.focus();
    } catch (error) {
        setChatStatus(error.message);
    }
}

async function deleteConversation() {
    if (state.isStreaming || state.conversationId === null) return;

    const conversationId = state.conversationId;

    try {
        await apiRequest(`/api/chat/conversations/${conversationId}`, {
            method: "DELETE",
        });

        state.conversationId = null;
        renderMessages([]);
        updateChatHeader(null);
        await loadConversations();

        if (state.conversations.length > 0) {
            await openConversation(state.conversations[0].ConversationID);
        }
    } catch (error) {
        setChatStatus(error.message);
    }
}

function updateContextMeter(promptTokens, responseTokens, contextWindow) {
    if (
        !Number.isFinite(promptTokens) ||
        !Number.isFinite(responseTokens) ||
        !Number.isFinite(contextWindow) ||
        contextWindow <= 0
    ) {
        elements.contextUsageText.textContent = "No usage data yet";
        elements.contextUsageFill.style.width = "0%";
        elements.contextUsageBar.setAttribute("aria-valuenow", "0");
        return;
    }

    const usedTokens = promptTokens + responseTokens;
    const percentage = Math.min(100, (usedTokens / contextWindow) * 100);

    elements.contextUsageText.textContent = `${usedTokens.toLocaleString()} / ${contextWindow.toLocaleString()} tokens (${Math.round(percentage)}%)`;

    elements.contextUsageFill.style.width = `${percentage}%`;
    elements.contextUsageBar.setAttribute("aria-valuenow", String(Math.round(percentage)));

    elements.contextUsageFill.classList.toggle("warning", percentage >= 70 && percentage < 90);
    elements.contextUsageFill.classList.toggle("danger", percentage >= 90);
}

function parseSseBlock(block, onChunk, onDone = () => {}) {
    let event = "message";
    const dataLines = [];

    for (const line of block.split(/\r?\n/)) {
        if (line.startsWith("event:")) {
            event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
        }
    }

    if (dataLines.length === 0) return;

    let data;

    try {
        data = JSON.parse(dataLines.join("\n"));
    } catch {
        throw new Error("Received an invalid streaming response.");
    }

    if (event === "chunk") {
        onChunk(data.content || "");
    } else if (event === "done") {
        onDone(data);
    } else if (event === "error") {
        throw new Error(data.error || "Response generation failed.");
    }
}

async function streamMessage(content, assistantBody, contextWindow) {
    const response = await fetch(`/api/chat/conversations/${state.conversationId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        body: JSON.stringify({ content }),
        signal: state.abortController.signal,
    });

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const data = await response.json();
            message = data.error || data.message || message;
        } catch {
            // The response did not contain JSON.
        }

        throw new Error(message);
    }

    if (!response.body) {
        throw new Error("Streaming is not supported by this response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop();

        for (const block of blocks) {
            parseSseBlock(
                block,
                (chunk) => {
                    assistantBody.textContent += chunk;
                    elements.messageList.scrollTop = elements.messageList.scrollHeight;
                },
                (data) => {
                    updateContextMeter(data.promptTokens, data.responseTokens, contextWindow);
                },
            );
        }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
        parseSseBlock(buffer, (chunk) => {
            assistantBody.textContent += chunk;
        });
    }

    renderAssistantMarkdown(assistantBody, assistantBody.textContent);
}

async function sendMessage(event) {
    event.preventDefault();

    if (state.isStreaming) {
        state.abortController?.abort();
        return;
    }

    const content = elements.messageInput.value.trim();

    if (!content) return;

    state.abortController = new AbortController();
    setStreaming(true);

    try {
        if (state.conversationId === null) {
            const result = await apiRequest("/api/chat/conversations", {
                method: "POST",
                body: JSON.stringify({
                    model: state.settings.DefaultModel || null,
                }),
            });

            state.conversationId = result.conversationId;
        }

        setStreaming(true);
        setChatStatus("");
        elements.messageInput.value = "";
        elements.messageInput.style.height = "auto";

        createMessageElement("user", content);
        const assistant = createMessageElement("assistant");

        await streamMessage(content, assistant.body, state.settings.ContextWindow);

        await loadConversations();

        const conversation = await apiRequest(`/api/chat/conversations/${state.conversationId}`);

        updateChatHeader(conversation);
        renderConversations();
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        setChatStatus(error.message);
    } finally {
        setStreaming(false);
        elements.messageInput.focus();
        state.abortController = null;
    }
}

function openSettings() {
    if (state.isStreaming) return;

    elements.settingsOverlay.classList.remove("hide");
    setSettingsStatus("");
}

function closeSettings() {
    elements.settingsOverlay.classList.add("hide");
    setSettingsStatus("");
}

async function saveSettings(event) {
    event.preventDefault();

    const settings = {
        defaultModel: elements.modelSelect.value || null,
        contextWindow: Number(elements.contextWindow.value),
        temperature: Number(elements.temperature.value),
    };

    elements.saveSettingsButton.disabled = true;
    setSettingsStatus("");

    try {
        const saved = await apiRequest("/api/chat/settings", {
            method: "PUT",
            body: JSON.stringify(settings),
        });

        state.settings = saved;

        if (state.conversationId === null) {
            updateChatHeader(null);
        }

        closeSettings();
    } catch (error) {
        setSettingsStatus(error.message);
    } finally {
        elements.saveSettingsButton.disabled = false;
    }
}

elements.newChatButton.addEventListener("click", createConversation);
elements.deleteChatButton.addEventListener("click", deleteConversation);
elements.messageForm.addEventListener("submit", sendMessage);
elements.settingsButton.addEventListener("click", openSettings);
elements.closeSettingsButton.addEventListener("click", closeSettings);
elements.cancelSettingsButton.addEventListener("click", closeSettings);
elements.settingsForm.addEventListener("submit", saveSettings);

elements.temperature.addEventListener("input", () => {
    elements.temperatureValue.textContent = Number(elements.temperature.value).toFixed(1);
});

elements.messageInput.addEventListener("input", () => {
    elements.messageInput.style.height = "auto";
    elements.messageInput.style.height = `${Math.min(elements.messageInput.scrollHeight, 180)}px`;
});

elements.messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        elements.messageForm.requestSubmit();
    }
});

elements.settingsOverlay.addEventListener("click", (event) => {
    if (event.target === elements.settingsOverlay) {
        closeSettings();
    }
});

async function initializeChat() {
    try {
        await loadSettings();
        await loadConversations();

        if (state.conversations.length > 0) {
            await openConversation(state.conversations[0].ConversationID);
        } else {
            renderMessages([]);
            updateChatHeader(null);
        }
    } catch (error) {
        setChatStatus(error.message);
    }
}

initializeChat();
