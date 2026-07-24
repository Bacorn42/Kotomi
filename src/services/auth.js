const argon2 = require("argon2");
const crypto = require("crypto");

const userRepository = require("../repositories/userRepository");
const sessionRepository = require("../repositories/sessionRepository");
const { createPlayer, ensurePlayer } = require("../repositories/playerRepository.js");

async function register(username, password) {
    username = normalizeUsername(username);
    if (!validateUsername(username)) {
        throw new Error(
            "Username must be 3-32 characters and contain only letters, numbers, and underscores",
        );
    }

    if (!validatePassword(password)) {
        throw new Error("Password must be 8-64 characters");
    }

    const existingUser = userRepository.getByUsername(username);

    if (existingUser) {
        throw new Error("Username already exists");
    }

    const passwordHash = await argon2.hash(password);

    const user = userRepository.createUser(username, passwordHash);
    createPlayer(user.UserID);

    return user;
}

async function login(username, password) {
    username = normalizeUsername(username);
    const user = userRepository.getByUsername(username);

    if (!user) {
        return null;
    }

    const valid = await argon2.verify(user.PasswordHash, password);

    if (!valid) {
        return null;
    }

    return {
        UserID: user.UserID,
        Username: user.Username,
    };
}

function createSession(userId) {
    const sessionId = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    sessionRepository.createSession(sessionId, userId, expires.toISOString());

    return sessionId;
}

function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,32}$/.test(username);
}

function normalizeUsername(username) {
    return username.toLowerCase();
}

function validatePassword(password) {
    return password.length >= 8 && password.length <= 64;
}

function getSession(sessionId) {
    return sessionRepository.getSession(sessionId);
}

function deleteSession(sessionId) {
    sessionRepository.deleteSession(sessionId);
}

module.exports = {
    register,
    login,
    createSession,
    getSession,
    deleteSession,
};
