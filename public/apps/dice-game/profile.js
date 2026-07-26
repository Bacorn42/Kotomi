import { initializeKotomiApp, formatUsername } from "/js/kotomi.js";
import { renderDice } from "./components/diceRenderer.js";
import { createItemCard } from "./components/itemCard.js";

initializeKotomiApp("dice-game");

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
        <div class="profile-player">
            <div class="profile-avatar">🎲</div>
            <div>
                <h2>${formatUsername(profile.username)}</h2>
                <p>Member since ${new Date(profile.createdDate).toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

function displayStats(profile) {
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
            <strong>$${(profile.moneyCents / 100).toFixed(2)}</strong>
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

function displayDiceSetup(profile) {
    document.getElementById("dice-setup").innerHTML = `
        <div class="stat-row">
            <span>Dice</span>
            <strong>${profile.diceCount}</strong>
        </div>
        <div class="stat-row">
            <span>Cooldown</span>
            <strong>${(profile.cooldownMs / 1000).toFixed(1)}s</strong>
        </div>
        <h3>Weights</h3>
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
    const data = await response.json();
    displayAchievements(data.achievements, data.stats);
}

function displayAchievements(achievements, stats) {
    const container = document.getElementById("achievements");
    const count = document.getElementById("achievement-count");

    const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
    count.textContent = `${unlockedCount} / ${achievements.length} unlocked`;

    container.innerHTML = "";

    for (const achievement of achievements) {
        const item = document.createElement("div");
        item.className = "achievement";

        if (!achievement.unlocked) {
            item.classList.add("locked");
        }

        const unlockedText = achievement.unlocked
            ? `<p class="achievement-date">Unlocked: ${formatDate(achievement.unlockedDate)}</p>`
            : "";

        const progress = getAchievementProgress(achievement, stats);

        const progressDisplay = !achievement.unlocked
            ? `
            <div class="achievement-progress">
                <div class="achievement-progress-fill" style="width:${progress.percent}%"></div>
            </div>
            <p class="achievement-progress-text">${progress.current}/${progress.target}</p>
        `
            : "";

        item.innerHTML = `
            <img src="/apps/dice-game/assets/achievements/${achievement.icon}" alt="${achievement.name}">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-tooltip">
                <strong>${achievement.name}</strong>
                <p>${achievement.description}</p>
                ${unlockedText}
                ${progressDisplay}
            </div>
        `;

        container.appendChild(item);
    }
}

function getAchievementProgress(achievement, stats) {
    let current = 0;

    switch (achievement.requirementType) {
        case "ROLL_COUNT":
            current = stats.totalRolls;
            break;
        case "TOTAL_SCORE":
            current = stats.totalScore;
            break;
        case "HIGH_SCORE":
            current = stats.highestScore;
            break;
    }

    return {
        current: Math.min(current, achievement.requirementValue),
        target: achievement.requirementValue,
        percent: Math.min(100, (current / achievement.requirementValue) * 100),
    };
}

function formatDate(date) {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleDateString();
}

async function loadItems() {
    const response = await fetch("/api/items/inventory");
    const data = await response.json();
    console.log(data);

    displayItems(data.items, data.maxActiveItems);
}

function displayItems(items, maxActiveItems) {
    const container = document.getElementById("items");
    const equipped = items.filter((item) => item.equipped);

    container.innerHTML = `
        <div class="equipped-items">
            <h3>Active Items (${equipped.length}/${maxActiveItems})</h3>
            <div class="active-item-list">
                ${
                    equipped.length
                        ? equipped
                              .map(
                                  (item) => `
                            <div class="active-item">
                                <img src="/apps/dice-game/assets/items/${item.icon}">
                                <span>${item.name}</span>
                            </div>
                        `,
                              )
                              .join("")
                        : "<p>No active items</p>"
                }
            </div>
        </div>
        <h3>Inventory</h3>
        <div class="item-grid">
            ${items
                .map((item) =>
                    createItemCard(item, {
                        showEquip: true,
                    }),
                )
                .join("")}
        </div>
    `;

    document.querySelectorAll(".item-toggle").forEach((button) => {
        button.addEventListener("click", () => toggleItem(button));
    });
}

async function toggleItem(button) {
    const id = button.dataset.id;
    const equipped = button.dataset.equipped === "true";
    const endpoint = equipped ? `/api/items/${id}/unequip` : `/api/items/${id}/equip`;

    await fetch(endpoint, {
        method: "POST",
    });

    await loadProfile();
    await loadItems();
}

await loadProfile();
await loadAchievements();
await loadItems();
