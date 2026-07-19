const express = require("express");
const ollama = require("../services/ollama");
const comfy = require("../services/comfyui");

const router = express.Router();

router.post("/generate", async (req, res) => {
    try {
        const userPrompt = req.body.prompt;

        console.log("Received prompt:");
        console.log(userPrompt);

        const enhancedPrompt = await ollama.generateImagePrompt(userPrompt);

        console.log("Gemma prompt:");
        console.log(enhancedPrompt);

        const promptID = await comfy.queueWorkflow(enhancedPrompt);

        res.json({
            success: true,
            enhanced: enhancedPrompt,
            promptID: promptID,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
