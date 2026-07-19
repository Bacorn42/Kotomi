const axios = require("axios");
const prompts = require("../../modules/image-generation/prompts");

async function generateImagePrompt(userPrompt) {
    const response = await axios.post("http://localhost:11434/api/generate", {
        model: "gemma2:2b",
        prompt: prompts.createImagePrompt(userPrompt),
        stream: false,
    });

    return response.data.response.trim();
}

module.exports = {
    generateImagePrompt,
};
