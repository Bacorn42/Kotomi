const statisticsRepository = require("../repositories/statisticsRepository.js");

function getStatistics(userId) {
    return {
        global: statisticsRepository.getGlobalStatistics(),
        player: statisticsRepository.getPlayerStatistics(userId),
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
