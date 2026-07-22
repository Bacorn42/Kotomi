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

        const sessionId = authService.createSession(user.UserID);

        res.cookie("kotomi_session", sessionId, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });

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
    const sessionId = req.cookies.kotomi_session;

    if (!sessionId) {
        return res.json({
            success: true,
            user: null,
        });
    }

    const user = authService.getSession(sessionId);

    if (!user) {
        return res.json({
            success: true,
            user: null,
        });
    }

    res.json({
        success: true,
        user,
    });
});

router.post("/logout", (req, res) => {
    const sessionId = req.cookies.kotomi_session;

    if (sessionId) {
        authService.deleteSession(sessionId);
    }

    res.clearCookie("kotomi_session");

    res.json({
        success: true,
    });
});

module.exports = router;
