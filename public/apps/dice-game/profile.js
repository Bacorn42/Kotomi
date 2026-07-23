import { initializeKotomiApp } from "/js/kotomi.js";

initializeKotomiApp("dice-game");

function getDieImage(value) {
    return `/apps/dice-game/assets/dice/classic/die-classic-${value}.png`;
}

async function loadProfile() {
    const response = await fetch("/api/dice/profile");
    const profile = await response.json();

    displayStats(profile);
    displayTopRolls(profile.topRolls);
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

        const sortedDice = [...roll.dice].sort((a, b) => a - b);

        let previousValue = null;

        for (const value of sortedDice) {
            if (previousValue !== null && previousValue !== value) {
                const gap = document.createElement("div");
                gap.className = "dice-group-gap history-gap";

                diceContainer.appendChild(gap);
            }

            const image = document.createElement("img");
            image.src = getDieImage(value);
            image.alt = `Die ${value}`;

            diceContainer.appendChild(image);

            previousValue = value;
        }

        const score = document.createElement("div");
        score.className = "roll-score";
        score.textContent = roll.score;

        item.appendChild(rank);
        item.appendChild(diceContainer);
        item.appendChild(score);

        container.appendChild(item);
    });
}

await loadProfile();
