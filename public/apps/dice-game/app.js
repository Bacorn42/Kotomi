import { initializeKotomiApp } from "/js/kotomi.js";
import { renderDice } from "./components/diceRenderer.js";
import { showItemDrop } from "./components/itemNotifications.js";

initializeKotomiApp("dice-game");

let rolling = false;
let cooldownInterval = null;

function getDieImage(value) {
    return `/apps/dice-game/assets/dice/classic/die-classic-${value}.png`;
}

async function loadHistory() {
    const response = await fetch("/api/dice/recent");

    if (!response.ok) {
        return;
    }

    const rolls = await response.json();

    displayHistory(rolls);
}

function displayHistory(rolls) {
    const history = document.getElementById("history");
    history.innerHTML = "";

    for (const roll of rolls) {
        const item = document.createElement("div");
        item.className = "history-roll";

        const diceContainer = document.createElement("div");
        diceContainer.className = "history-dice";
        renderDice(diceContainer, roll.dice);

        const score = document.createElement("div");
        score.className = "history-score";
        score.innerHTML = `Score: <strong>${roll.score}</strong>`;

        item.appendChild(diceContainer);
        item.appendChild(score);

        history.appendChild(item);
    }
}

async function rollDice() {
    const response = await fetch("/api/dice/roll", {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Failed to roll dice");
    }

    return await response.json();
}

function createDie(value, animate = false) {
    const die = document.createElement("div");
    die.className = "die";

    const image = document.createElement("img");
    image.src = getDieImage(value);
    image.alt = `Die showing ${value}`;

    die.appendChild(image);

    if (animate) {
        die.classList.add("rolling");

        const duration = (Math.random() * 0.25 + 0.25).toFixed(2);
        const delay = (Math.random() * 0.4).toFixed(2);
        const rotation = Math.floor(Math.random() * 90) - 45;

        die.style.setProperty("--shake-duration", `${duration}s`);
        die.style.setProperty("--shake-delay", `${delay}s`);
        die.style.setProperty("--initial-rotation", `${rotation}deg`);
    }

    return die;
}

function displayRoll(result) {
    const resultElement = document.getElementById("result");
    resultElement.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Your Roll";

    const diceContainer = document.createElement("div");
    diceContainer.className = "dice-values";
    renderDice(diceContainer, result.dice);

    const score = document.createElement("h3");
    score.textContent = `Score: ${result.score}`;
    if (result.moneyCents > 0) {
        score.textContent += ` (+$${(result.moneyCents / 100).toFixed(2)})`;
    }

    resultElement.appendChild(title);
    resultElement.appendChild(diceContainer);
    resultElement.appendChild(score);
}

function showRollingAnimation() {
    const resultElement = document.getElementById("result");
    resultElement.innerHTML = "";

    const diceContainer = document.createElement("div");
    diceContainer.className = "dice-values";

    for (let i = 0; i < 10; i++) {
        const die = createDie(Math.floor(Math.random() * 6) + 1, true);
        diceContainer.appendChild(die);
    }

    resultElement.appendChild(diceContainer);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initialize() {
    const response = await fetch("/api/dice/profile");
    const profile = await response.json();

    const button = document.getElementById("rollButton");

    button.addEventListener("click", async () => {
        if (rolling) {
            return;
        }

        rolling = true;

        button.disabled = true;
        showRollingAnimation();
        button.textContent = "Rolling...";

        const startTimestamp = Date.now();

        try {
            const result = await rollDice();
            await sleep(1000);
            displayRoll(result);
            await loadHistory();

            if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
                showAchievementNotifications(result.unlockedAchievements);
            }

            if (result.droppedItem) {
                showItemDrop(result.droppedItem);
            }
        } catch (error) {
            console.error(error);
            document.getElementById("result").textContent = "Something went wrong.";
            button.textContent = "Throw Dice";
            button.disabled = false;
            rolling = false;
            return;
        }

        cooldownInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTimestamp;
            const remainingTime = profile.cooldownMs - elapsedTime;
            const seconds = (remainingTime / 1000).toFixed(1);
            button.textContent = `Wait ${seconds}s`;

            if (remainingTime <= 0) {
                button.textContent = "Throw Dice";
                button.disabled = false;
                rolling = false;
                clearInterval(cooldownInterval);
            }
        }, 50);
    });

    await loadHistory();
}

function sortDice(dice) {
    return [...dice].sort((a, b) => a - b);
}

function showAchievementNotifications(achievements) {
    const container = document.getElementById("achievement-notifications");

    for (const achievement of achievements) {
        const notification = document.createElement("div");
        notification.className = "achievement-notification";
        notification.innerHTML = `
            <img src="/apps/dice-game/assets/achievements/${achievement.Icon}">
            <div>
                <strong>Achievement Unlocked!</strong>
                <div>${achievement.Name}</div>
                <p>${achievement.Description}</p>
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

initialize();
