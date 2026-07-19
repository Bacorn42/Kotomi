const axios = require("axios");

async function generateImagePrompt(userPrompt) {
    const response = await axios.post("http://localhost:11434/api/generate", {
        model: "gemma2:2b",

        prompt: `
You are an expert prompt engineer for AI image generation.

Convert the user's idea into a detailed prompt for Z-Image Turbo.

Focus on:
- subject
- environment
- lighting
- composition
- artistic style
- camera details

Only output the final image prompt.

User idea:

${userPrompt}
`,

        stream: false,
    });

    return response.data.response.trim();
}

module.exports = {
    generateImagePrompt,
};
