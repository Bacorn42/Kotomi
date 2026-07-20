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
            model: model,
            prompt: prompts.createImagePrompt(userPrompt),
            stream: false,
        });
        return response.data.response.trim();
    } catch (error) {
        console.error(error.message);
        throw new Error("Could not generate enhanced prompt.");
    }
}

module.exports = {
    getModels,
    generateImagePrompt,
};
