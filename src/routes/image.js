const express = require("express");
const axios = require("axios");
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
        const history = await comfy.waitForCompletion(promptID);
        const image = comfy.extractImage(history);

        res.json({
            success: true,
            enhanced: enhancedPrompt,
            image: image,
        });
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

        const response = await axios.get("http://127.0.0.1:8188/view", {
            params: {
                filename: filename,
                type: "output",
            },

            responseType: "stream",
        });

        res.setHeader("Content-Type", response.headers["content-type"]);

        response.data.pipe(res);
    } catch (error) {
        console.error(error);

        res.status(500).send("Could not retrieve image");
    }
});

module.exports = router;
