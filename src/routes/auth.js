const express = require("express");

const router = express.Router();

const authService = require("../services/auth");

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authService.register(username, password);

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authService.login(username, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.get("/me", (req, res) => {
    res.json({
        success: false,
        user: null,
    });
});

router.post("/logout", (req, res) => {
    res.json({
        success: true,
    });
});

module.exports = router;
