import { stat } from "./statRow.js";
import { formatMoney, formatNumber } from "../utils/formatters.js";

export function displayGlobal(stats) {
    document.getElementById("global-stats").innerHTML = `
        ${stat("Players", stats.RegisteredPlayers)}
        ${stat("Total Rolls", stats.TotalRolls)}
        ${stat("Total Score", stats.TotalScore)}
        ${stat("Money Earned", formatMoney(stats.TotalMoneyCents))}
        ${stat("Average Score", formatNumber(stats.AverageScore))}
        ${stat("Highest Score", stats.HighestScore)}
        ${stat("Achievements Unlocked", stats.TotalUnlockedAchievements)}
    `;
}

export function displayPlayer(stats) {
    document.getElementById("player-stats").innerHTML = `
        ${stat("Your Rolls", stats.TotalRolls)}
        ${stat("Your Score", stats.TotalScore)}
        ${stat("Money Earned", formatMoney(stats.TotalMoneyCents))}
        ${stat("Average Score", formatNumber(stats.AverageScore))}
        ${stat("Highest Score", stats.HighestScore)}
        ${stat("Items", stats.TotalItems)}
        ${stat("Equipped Items", stats.EquippedItems)}
        ${stat("Achievements", stats.UnlockedAchievements)}
    `;
}

export function displayItems(stats) {
    document.getElementById("item-stats").innerHTML = `
        ${stat("Total Items Found", stats.TotalItems)}
        ${stat("Common", stats.CommonItems)}
        ${stat("Uncommon", stats.UncommonItems)}
        ${stat("Rare", stats.RareItems)}
        ${stat("Epic", stats.EpicItems)}
        ${stat("Legendary", stats.LegendaryItems)}
    `;
}
