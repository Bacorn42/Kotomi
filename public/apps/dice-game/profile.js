import { initializeKotomiApp, formatUsername } from "/js/kotomi.js";
import { renderDice } from "./components/diceRenderer.js";

initializeKotomiApp("dice-game");

function getDieImage(value) {
    return `/apps/dice-game/assets/dice/classic/die-classic-${value}.png`;
}

async function loadProfile() {
    const response = await fetch("/api/dice/profile");
    const profile = await response.json();

    displayPlayerInfo(profile);
    displayStats(profile);
    displayDiceSetup(profile);
    displayTopRolls(profile.topRolls);
}

function displayPlayerInfo(profile) {
    document.getElementById("player-info").innerHTML = `
        <div class="stat-row">
            <span>Username</span>
            <strong>${formatUsername(profile.username)}</strong>
        </div>
        <div class="stat-row">
            <span>Member Since</span>
            <strong>${new Date(profile.createdDate).toLocaleDateString()}</strong>
        </div>
    `;
}

function displayStats(profile) {
    document.getElementById("stats").innerHTML = `
        <div class="stat-row">
            <span>Total Rolls</span>
            <strong>${profile.totalRolls}</strong>
        </div>
        <div class="stat-row">
            <span>Total Score</span>
            <strong>${profile.totalScore}</strong>
        </div>
        <div class="stat-row">
            <span>Average Roll</span>
            <strong>${profile.averageScore}</strong>
        </div>
        <div class="stat-row">
            <span>Highest Roll</span>
            <strong>${profile.highestScore}</strong>
        </div>
    `;
}

function displayDiceSetup(profile) {
    document.getElementById("dice-setup").innerHTML = `
        <div class="stat-row">
            <span>Dice</span>
            <strong>${profile.diceCount}</strong>
        </div>

        <h3>
            Weights
        </h3>


        <table class="weights-table">
            <thead>
                <tr>
                    <th>Value</th>
                    ${profile.weights.map((_, index) => `<th>${index + 1}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Weight</th>
                    ${profile.weights.map((weight) => `<td>${weight}</td>`).join("")}
                </tr>
            </tbody>
        </table>
    `;
}

function displayTopRolls(rolls) {
    const container = document.getElementById("top-rolls");
    container.innerHTML = "";

    rolls.forEach((roll, index) => {
        const item = document.createElement("div");
        item.className = "top-roll";

        const rank = document.createElement("div");
        rank.className = "roll-rank";
        rank.textContent = `#${index + 1}`;

        const diceContainer = document.createElement("div");
        diceContainer.className = "history-dice";
        renderDice(diceContainer, roll.dice);

        const score = document.createElement("div");
        score.className = "roll-score";
        score.textContent = roll.score;

        item.appendChild(rank);
        item.appendChild(diceContainer);
        item.appendChild(score);

        container.appendChild(item);
    });
}

async function loadAchievements() {
    const response = await fetch("/api/achievements");
    const achievements = await response.json();
    displayAchievements(achievements);
}

function displayAchievements(achievements) {
    const container = document.getElementById("achievements");

    container.innerHTML = "";

    for (const achievement of achievements) {
        const item = document.createElement("div");
        item.className = "achievement";

        if (!achievement.unlocked) {
            item.classList.add("locked");
        }

        item.innerHTML = `
            <img src="/apps/dice-game/assets/achievements/${achievement.icon}" alt="${achievement.name}">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-tooltip">
                <strong>${achievement.name}</strong>
                <p>${achievement.description}</p>
            </div>
        `;

        container.appendChild(item);
    }
}

await loadProfile();
await loadAchievements();
