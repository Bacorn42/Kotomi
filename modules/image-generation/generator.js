const ollama = require("../../src/services/ollama");
const comfyui = require("../../src/services/comfyui");
const socket = require("../../src/services/socket");

async function generate(userPrompt, model, enhancePrompt, settings) {
    let finalPrompt = userPrompt;
    if (enhancePrompt) {
        socket.sendStatus("Creating enhanced prompt...");
        finalPrompt = await ollama.generateImagePrompt(userPrompt, model);
        socket.sendStatus("Prompt created. Starting image generation...");
    } else {
        socket.sendStatus("Starting image generation...");
    }
    socket.sendPrompt(finalPrompt);
    const { promptID, clientID } = await comfyui.queueWorkflow(finalPrompt, settings);
    await comfyui.listenForProgress(promptID, clientID);
    const history = await comfyui.waitForCompletion(promptID);
    const image = comfyui.extractImage(history);
    return image;
}

module.exports = {
    generate,
};
