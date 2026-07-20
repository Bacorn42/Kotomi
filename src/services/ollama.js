const axios = require("axios");
const prompts = require("../../modules/image-generation/prompts");

const OLLAMA_URL = "http://127.0.0.1:11434";

let cachedModels = [];
let lastRefresh = 0;

const MODEL_CACHE_TIME = 60 * 60 * 1000; // 1 hour

async function getModels() {
    if (cachedModels.length > 0 && Date.now() - lastRefresh < MODEL_CACHE_TIME) {
        return cachedModels;
    }

    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) {
        throw new Error("Failed to retrieve Ollama models.");
    }

    const data = await response.json();
    cachedModels = data.models.map((model) => ({
        name: model.name,
    }));
    lastRefresh = Date.now();

    return cachedModels;
}

async function generateImagePrompt(userPrompt, model) {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: model,
        prompt: prompts.createImagePrompt(userPrompt),
        stream: false,
    });

    return response.data.response.trim();
}

module.exports = {
    getModels,
    generateImagePrompt,
};
