const express = require("express");
const router = express.Router();

const ollama = require("../services/ollama");

router.get("/models", async (req, res) => {
    try {
        const models = await ollama.getModels();
        res.json(models);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Unable to retrieve models.",
        });
    }
});

module.exports = router;
