const argon2 = require("argon2");

const userRepository = require("../repositories/userRepository");

async function register(username, password) {
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

    return user;
}

async function login(username, password) {
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

function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,32}$/.test(username);
}

function validatePassword(password) {
    return password.length >= 8 && password.length <= 64;
}

module.exports = {
    register,
    login,
};
