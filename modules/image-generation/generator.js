async function generate(userPrompt) {
    const enhanced = await ollama.generateImagePrompt(userPrompt);
    const image = await comfy.generate(enhanced);

    return image;
}

module.exports = {
    generate,
};
