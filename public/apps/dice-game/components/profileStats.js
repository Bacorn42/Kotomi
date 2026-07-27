import { formatMoney } from "../utils/formatters.js";

export function displayStats(profile) {
    document.getElementById("stats").innerHTML = `
        <div class="stat-card">
            <span>Total Rolls</span>
            <strong>${profile.totalRolls}</strong>
        </div>

        <div class="stat-card">
            <span>Total Score</span>
            <strong>${profile.totalScore}</strong>
        </div>

        <div class="stat-card">
            <span>Money</span>
            <strong>${formatMoney(profile.moneyCents)}</strong>
        </div>

        <div class="stat-card">
            <span>Highest Roll</span>
            <strong>${profile.highestScore}</strong>
        </div>

        <div class="stat-card">
            <span>Average Roll</span>
            <strong>${Math.round(profile.averageScore)}</strong>
        </div>
    `;
}
