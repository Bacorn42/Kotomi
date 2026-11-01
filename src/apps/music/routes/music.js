const express = require("express");

const { requireLogin } = require("../../../middleware/auth");
const { ensureMusicDirectories } = require("../config/storage");

const router = express.Router();

ensureMusicDirectories();

router.get("/status", requireLogin, (req, res) => {
    res.json({
        message: "Music API is working.",
    });
});

module.exports = router;
