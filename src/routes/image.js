const express = require("express");

const router = express.Router();

router.post("/generate", (req, res) => {
    const userPrompt = req.body.prompt;

    console.log("Received prompt:");
    console.log(userPrompt);

    res.json({
        success: true,
        message: "Prompt received!",
        prompt: userPrompt,
    });
});

module.exports = router;
