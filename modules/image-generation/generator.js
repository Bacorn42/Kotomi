const ollama = require("../../src/services/ollama");
const comfy = require("../../src/services/comfyui");
const socket = require("../../src/services/socket");

async function generate(userPrompt, model, settings) {
    socket.sendStatus("Creating enhanced prompt...");
    const enhanced = await ollama.generateImagePrompt(userPrompt, model);
    socket.sendStatus("Prompt created. Starting image generation...");
    const { promptID, clientID } = await comfy.queueWorkflow(enhanced, settings);
    await comfy.listenForProgress(promptID, clientID);
    const history = await comfy.waitForCompletion(promptID);
    const image = comfy.extractImage(history);
    return image;
}

module.exports = {
    generate,
};
