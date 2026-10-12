const axios = require("axios");
const readline = require("readline");

const prompts = require("../apps/image-generator/core/prompts");

const OLLAMA_URL = "http://127.0.0.1:11434";

let cachedModels = [];
let lastRefresh = 0;

const MODEL_CACHE_TIME = 60 * 60 * 1000;

async function getModels() {
    if (cachedModels.length > 0 && Date.now() - lastRefresh < MODEL_CACHE_TIME) {
        return cachedModels;
    }

    const response = await axios.get(`${OLLAMA_URL}/api/tags`);

    cachedModels = response.data.models.map((model) => ({
        name: model.name,
    }));

    lastRefresh = Date.now();

    return cachedModels;
}

async function generateImagePrompt(userPrompt, model) {
    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model,
            prompt: prompts.createImagePrompt(userPrompt),
            stream: false,
            options: {
                temperature: 0.42,
            },
        });

        return response.data.response.trim();
    } catch (error) {
        console.error(error.message);
        throw new Error("Could not generate enhanced prompt.");
    }
}

async function streamChat(messages, model, options = {}, onChunk = () => {}) {
    const { contextWindow = 8192, temperature = 0.7, signal } = options;
    let fullResponse = "";
    let promptTokens = null;
    let responseTokens = null;

    try {
        const response = await axios.post(
            `${OLLAMA_URL}/api/chat`,
            {
                model,
                messages,
                stream: true,
                options: {
                    num_ctx: contextWindow,
                    temperature: temperature,
                },
            },
            {
                responseType: "stream",
                signal,
            },
        );

        const lines = readline.createInterface({
            input: response.data,
            crlfDelay: Infinity,
        });

        for await (const line of lines) {
            if (!line.trim()) {
                continue;
            }

            const data = JSON.parse(line);

            if (data.error) {
                throw new Error(data.error);
            }

            const content = data.message?.content;

            if (content) {
                fullResponse += content;
                onChunk(content);
            }

            if (data.done) {
                promptTokens = data.prompt_eval_count ?? null;
                responseTokens = data.eval_count ?? null;
                break;
            }
        }

        return {
            content: fullResponse,
            promptTokens,
            responseTokens,
        };
    } catch (error) {
        if (signal?.aborted || axios.isCancel(error)) {
            return {
                content: fullResponse,
                promptTokens,
                responseTokens,
            };
        }

        console.error("Ollama chat error:", error.message);
        throw new Error("Could not generate chat response.");
    }
}

module.exports = {
    getModels,
    generateImagePrompt,
    streamChat,
};
