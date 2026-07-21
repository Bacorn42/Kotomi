const express = require("express");
const axios = require("axios");
const generator = require("../../modules/image-generation/generator");
const comfyui = require("../../src/services/comfyui");
const imageRepository = require("../repositories/imageRepository");

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

router.post("/cancel", async (req, res) => {
    try {
        await comfyui.interrupt();
        res.json({
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message,
        });
    }
});

router.get("/history", (req, res) => {
    try {
        const images = imageRepository.getRecent();
        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Unable to retrieve image history.",
        });
    }
});

module.exports = router;
