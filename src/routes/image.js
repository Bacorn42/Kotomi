const express = require("express");
const axios = require("axios");
const generator = require("../../modules/image-generation/generator");

const router = express.Router();

router.post("/generate", async (req, res) => {
    try {
        const { prompt, model, enhancePrompt, settings } = req.body;
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
