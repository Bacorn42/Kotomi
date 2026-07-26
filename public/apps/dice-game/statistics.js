import { initializeKotomiApp, formatUsername } from "/js/kotomi.js";

initializeKotomiApp("dice-game");

async function loadStatistics() {
    const response = await fetch("/api/dice/statistics");
    const data = await response.json();

    displayGlobal(data.global);
    displayPlayer(data.player);

    displayItems(data.global);

    displayLeaderboard("score-leaderboard", data.leaderboards.highestScores, "Score", "Score");

    displayLeaderboard("roll-leaderboard", data.leaderboards.rolls, "Rolls", "TotalRolls");

    displayLeaderboard(
        "money-leaderboard",
        data.leaderboards.money,
        "Money",
        "TotalMoneyCents",
        true,
    );

    displayLeaderboard(
        "achievement-leaderboard",
        data.leaderboards.achievements,
        "Achievements",
        "Achievements",
    );
}

function displayGlobal(stats) {
    document.getElementById("global-stats").innerHTML = `
        ${stat("Players", stats.RegisteredPlayers)}
        ${stat("Total Rolls", stats.TotalRolls)}
        ${stat("Total Score", stats.TotalScore)}
        ${stat("Money Earned", money(stats.TotalMoneyCents))}
        ${stat("Average Score", formatNumber(stats.AverageScore))}
        ${stat("Highest Score", stats.HighestScore)}
        ${stat("Achievements Unlocked", stats.TotalUnlockedAchievements)}
    `;
}

function displayPlayer(stats) {
    document.getElementById("player-stats").innerHTML = `
        ${stat("Your Rolls", stats.TotalRolls)}
        ${stat("Your Score", stats.TotalScore)}
        ${stat("Money Earned", money(stats.TotalMoneyCents))}
        ${stat("Average Score", formatNumber(stats.AverageScore))}
        ${stat("Highest Score", stats.HighestScore)}
        ${stat("Items", stats.TotalItems)}
        ${stat("Equipped Items", stats.EquippedItems)}
        ${stat("Achievements", stats.UnlockedAchievements)}
    `;
}

function displayItems(stats) {
    document.getElementById("item-stats").innerHTML = `
        ${stat("Total Items Found", stats.TotalItems)}
        ${stat("Common", stats.CommonItems)}
        ${stat("Uncommon", stats.UncommonItems)}
        ${stat("Rare", stats.RareItems)}
        ${stat("Epic", stats.EpicItems)}
        ${stat("Legendary", stats.LegendaryItems)}
    `;
}

function displayLeaderboard(id, entries, label, valueKey, currency = false) {
    const container = document.getElementById(id);

    if (!entries.length) {
        container.innerHTML = "<p>No data yet.</p>";
        return;
    }

    container.innerHTML = entries
        .map(
            (entry, index) => `
            <div class="stat-row">
                <span>#${index + 1} ${formatUsername(entry.Username)}</span>
                <strong>${currency ? money(entry[valueKey]) : entry[valueKey]}</strong>
            </div>
        `,
        )
        .join("");
}

function stat(label, value) {
    return `
        <div class="stat-row">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `;
}

function money(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

function formatNumber(value) {
    return Number(value).toFixed(2);
}

await loadStatistics();
