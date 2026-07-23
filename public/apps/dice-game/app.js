import { initializeKotomiApp } from "/js/kotomi.js";

initializeKotomiApp("dice-game");

let rolling = false;

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

    const sortedDice = sortDice(result.dice);
    let previousValue = null;

    for (const value of sortedDice) {
        if (previousValue !== null && previousValue !== value) {
            const gap = document.createElement("div");
            gap.className = "dice-group-gap";
            diceContainer.appendChild(gap);
        }

        diceContainer.appendChild(createDie(value));

        previousValue = value;
    }

    const score = document.createElement("h3");
    score.textContent = `Score: ${result.score}`;

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
    const button = document.getElementById("rollButton");

    button.addEventListener("click", async () => {
        if (rolling) {
            return;
        }

        rolling = true;

        button.disabled = true;
        showRollingAnimation();
        button.textContent = "Rolling...";
        await sleep(1000);

        try {
            const result = await rollDice();
            displayRoll(result);
        } catch (error) {
            console.error(error);
            document.getElementById("result").textContent = "Something went wrong.";
        }

        for (let seconds = 4; seconds > 0; seconds--) {
            button.textContent = `Wait ${seconds}s`;
            await sleep(1000);
        }

        button.textContent = "Throw Dice";
        button.disabled = false;

        rolling = false;
    });
}

function sortDice(dice) {
    return [...dice].sort((a, b) => a - b);
}

initialize();
