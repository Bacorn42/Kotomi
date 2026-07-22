const authService = require("../services/auth");

function requireLogin(req, res, next) {
    const sessionId = req.cookies.kotomi_session;

    if (!sessionId) {
        return res.status(401).json({
            message: "Login required",
        });
    }

    const session = authService.getSession(sessionId);

    if (!session) {
        return res.status(401).json({
            message: "Invalid session",
        });
    }

    if (new Date(session.ExpiresDate) < new Date()) {
        authService.deleteSession(sessionId);

        return res.status(401).json({
            message: "Session expired",
        });
    }

    req.user = {
        UserID: session.UserID,
        Username: session.Username,
    };

    next();
}

module.exports = {
    requireLogin,
};
