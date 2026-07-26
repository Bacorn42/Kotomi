import { initializeKotomiApp, formatUsername } from "/js/kotomi.js";
import { renderDice } from "./components/diceRenderer.js";
import { showItemDrop } from "./components/itemNotifications.js";

initializeKotomiApp("dice-game");

const socket = io();
let feedQueue = [];
let feedProcessing = false;

let rolling = false;
let cooldownInterval = null;

function getDieImage(value) {
    return `/apps/dice-game/assets/dice/classic/die-classic-${value}.png`;
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
    socket.on("dice-feed", (event) => {
        addFeedEvent(event);
    });

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

function addFeedEvent(event) {
    feedQueue.push(event);
    processFeedQueue();
}

async function processFeedQueue() {
    if (feedProcessing) {
        return;
    }

    feedProcessing = true;

    while (feedQueue.length > 0) {
        const event = feedQueue.shift();
        await sleep(1000);
        displayFeedEvent(event);
    }

    feedProcessing = false;
}

function displayFeedEvent(event) {
    const feed = document.getElementById("live-feed");

    const item = document.createElement("div");
    item.className = "feed-event";
    item.innerHTML = formatFeedEvent(event);

    feed.prepend(item);

    while (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

function formatFeedEvent(event) {
    switch (event.type) {
        case "ROLL":
            return `
                <div>
                    <span>🎲</span>
                    <strong>${formatUsername(event.username)}</strong>
                    rolled 
                    <strong>${event.score}</strong>
                    points
                    ${
                        event.moneyCents > 0
                            ? `<span>(+$${(event.moneyCents / 100).toFixed(2)})</span>`
                            : ""
                    }
                </div>
            `;

        case "ITEM":
            return `
                <div>
                    <span>✨</span>
                    <strong>${formatUsername(event.username)}</strong>
                    found
                    <strong class="${event.item.rarity.toLowerCase()}">
                        ${event.item.name}
                    </strong>
                </div>
            `;

        case "ACHIEVEMENT":
            return `
                <div>
                    <span>🏆</span>
                    <strong>${formatUsername(event.username)}</strong>
                    unlocked
                    <strong>${event.achievement.Name}</strong>
                </div>
            `;

        default:
            return "";
    }
}

initialize();
