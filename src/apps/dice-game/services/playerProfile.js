const userRepository = require("../../../repositories/userRepository.js");
const playerRepository = require("../repositories/playerRepository.js");
const rollRepository = require("../repositories/rollRepository.js");
const { getDiceConfiguration } = require("./diceConfiguration.js");
const { getPlayerConfiguration } = require("./playerConfiguration.js");

function getPlayerProfile(userId) {
    const user = userRepository.getById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const player = playerRepository.getPlayer(userId);
    const stats = rollRepository.getUserStats(userId);
    const topRolls = rollRepository.getUserTopRolls(userId);
    const configuration = getPlayerConfiguration(getDiceConfiguration(player), userId);

    return {
        username: user.username,
        createdDate: user.createdDate,

        totalRolls: stats.totalRolls,
        totalScore: stats.totalScore,
        moneyCents: player.moneyCents,
        averageScore: Number(stats.averageScore.toFixed(2)),
        highestScore: stats.highestScore,

        diceCount: configuration.diceCount,
        weights: configuration.weights,
        cooldownMs: configuration.cooldownMs,
        topRolls,
    };
}

module.exports = {
    getPlayerProfile,
};
