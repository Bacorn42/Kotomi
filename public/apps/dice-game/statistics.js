import { initializeKotomiApp, formatUsername } from "/js/kotomi.js";
import { getStatistics } from "./services/statisticsApi.js";
import { displayGlobal, displayPlayer, displayItems } from "./components/statisticsCards.js";
import { displayLeaderboard } from "./components/leaderboard.js";

initializeKotomiApp("dice-game");

async function loadStatistics() {
    const data = await getStatistics();

    displayGlobal(data.global);
    displayPlayer(data.player);
    displayItems(data.global);

    displayLeaderboard("score-leaderboard", data.leaderboards.highestScores, "Score");
    displayLeaderboard("roll-leaderboard", data.leaderboards.rolls, "TotalRolls");
    displayLeaderboard("money-leaderboard", data.leaderboards.money, "TotalMoneyCents", {
        currency: true,
    });
    displayLeaderboard("achievement-leaderboard", data.leaderboards.achievements, "Achievements");
}

async function initialize() {
    try {
        await loadStatistics();
    } catch (error) {
        console.error("Failed to load statistics:", error);
    }
}

initialize();
