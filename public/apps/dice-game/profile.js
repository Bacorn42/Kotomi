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
        <div class="card">
            <p>
                Total Rolls:
                <strong>${profile.totalRolls}</strong>
            </p>

            <p>
                Total Score:
                <strong>${profile.totalScore}</strong>
            </p>

            <p>
                Average Roll:
                <strong>${profile.averageScore}</strong>
            </p>

            <p>
                Highest Roll:
                <strong>${profile.highestScore}</strong>
            </p>
        </div>
    `;
}

function displayTopRolls(rolls) {
    const container = document.getElementById("top-rolls");

    for (const roll of rolls) {
        const item = document.createElement("div");
        item.className = "history-roll";
        item.innerHTML = `
            <div class="history-dice">
                ${roll.dice.map((value) => `<img src="${getDieImage(value)}">`).join("")}
            </div>
            <strong>${roll.score}</strong>

        `;

        container.appendChild(item);
    }
}

await loadProfile();
