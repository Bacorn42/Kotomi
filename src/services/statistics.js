const statisticsRepository = require("../repositories/statisticsRepository.js");

function getStatistics(userId) {
    return {
        global: {
            ...statisticsRepository.getGlobalStats(),
            ...statisticsRepository.getGlobalItemStats(),
            ...statisticsRepository.getGlobalPlayerStats(),
            ...statisticsRepository.getGlobalAchievementStats(),
        },

        player: {
            ...statisticsRepository.getPlayerStats(userId),
            ...statisticsRepository.getPlayerInventoryStats(userId),
            ...statisticsRepository.getPlayerAchievementStats(userId),
        },

        leaderboards: {
            highestScores: statisticsRepository.getHighestScoreLeaderboard(),
            money: statisticsRepository.getMoneyLeaderboard(),
            rolls: statisticsRepository.getRollLeaderboard(),
            achievements: statisticsRepository.getAchievementLeaderboard(),
        },
    };
}

module.exports = {
    getStatistics,
};
