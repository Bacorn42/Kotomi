const db = require("../../../database/db.js");
const userRepository = require("../../../repositories/userRepository.js");
const playerRepository = require("../repositories/playerRepository.js");
const rollRepository = require("../repositories/rollRepository.js");
const { getDiceConfiguration } = require("./diceConfiguration.js");
const { getPlayerConfiguration } = require("./playerConfiguration.js");

function getPlayerProfile(userId) {
    const user = userRepository.getById(userId);
    const player = playerRepository.getPlayer(userId);
    const stats = rollRepository.getUserStats(userId);
    const topRolls = rollRepository.getUserTopRolls(userId);
    const configuration = getPlayerConfiguration(getDiceConfiguration(player), userId);

    return {
        username: user.Username,
        createdDate: user.CreatedDate,

        totalRolls: stats.totalRolls,
        totalScore: stats.totalScore,
        moneyCents: player.MoneyCents,
        averageScore: Number(stats.averageScore.toFixed(2)),
        highestScore: stats.highestScore,

        diceCount: configuration.diceCount,
        weights: configuration.weights,
        topRolls: topRolls.map((roll) => ({
            rollId: roll.RollID,
            dice: JSON.parse(roll.DiceValues),
            score: roll.Score,
            createdDate: roll.CreatedDate,
        })),
    };
}

module.exports = {
    getPlayerProfile,
};
