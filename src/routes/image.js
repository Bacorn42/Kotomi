const express = require("express");
const axios = require("axios");
const generator = require("../../modules/image-generation/generator");
const comfyui = require("../../src/services/comfyui");

const router = express.Router();

router.post("/generate", async (req, res) => {
    try {
        const { prompt, model, enhancePrompt, settings } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Prompt is required.",
            });
        }

        const result = await generator.generate(prompt, model, enhancePrompt, settings);

        res.json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

router.get("/view", async (req, res) => {
    try {
        const filename = req.query.filename;

        const response = await comfyui.getImage(filename);

        res.setHeader("Content-Type", response.headers["content-type"]);

        response.data.pipe(res);
    } catch (error) {
        console.error(error);

        res.status(500).send("Could not retrieve image");
    }
});

module.exports = router;
