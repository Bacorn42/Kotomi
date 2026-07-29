const ollama = require("../../../services/ollama");
const comfyui = require("../services/comfyui");
const socket = require("../../../services/socket");
const imageRepository = require("../repositories/imageRepository");

async function generate(userId, userPrompt, model, enhancePrompt, settings) {
    let finalPrompt = userPrompt;
    if (enhancePrompt) {
        socket.sendStatus("Creating enhanced prompt...");
        finalPrompt = await ollama.generateImagePrompt(userPrompt, model);
        socket.sendStatus("Prompt created. Starting image generation...");
    } else {
        socket.sendStatus("Starting image generation...");
    }

    socket.sendPrompt(finalPrompt);
    const { promptID, clientID, seed } = await comfyui.queueWorkflow(finalPrompt, settings);
    socket.sendGenerationStarted();
    await comfyui.listenForProgress(promptID, clientID);
    const history = await comfyui.waitForCompletion(promptID);
    const image = comfyui.extractImage(history);
    if (image === null) {
        return null;
    }

    imageRepository.save(userId, {
        filename: image.filename,
        prompt: userPrompt,
        enhancedPrompt: finalPrompt,
        width: settings.width,
        height: settings.height,
        steps: settings.steps,
        seed: seed,
        model: model,
        createdDate: new Date().toISOString(),
    });

    return image;
}

module.exports = {
    generate,
};
