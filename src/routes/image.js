const express = require("express");
const ollama = require("../services/ollama");

const router = express.Router();

router.post("/generate", async (req, res) => {
    try {
        const userPrompt = req.body.prompt;

        console.log("Received prompt:");
        console.log(userPrompt);

        const enhancedPrompt = await ollama.generateImagePrompt(userPrompt);

        console.log("Gemma prompt:");
        console.log(enhancedPrompt);

        res.json({
            success: true,
            original: userPrompt,
            enhanced: enhancedPrompt,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Ollama request failed",
        });
    }
});

module.exports = router;
