import { initializeKotomiApp } from "/js/kotomi.js";

initializeKotomiApp("dice-game");

let rolling = false;

const dieFaces = {
    1: "⚀",
    2: "⚁",
    3: "⚂",
    4: "⚃",
    5: "⚄",
    6: "⚅",
};

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

    if (animate) {
        die.classList.add("rolling");
    }

    die.textContent = dieFaces[value];

    return die;
}

function displayRoll(result) {
    const resultElement = document.getElementById("result");
    resultElement.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Your Roll";

    const diceContainer = document.createElement("div");
    diceContainer.className = "dice-values";

    for (const value of result.dice) {
        diceContainer.appendChild(createDie(value));
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
        await sleep(1200);

        try {
            const result = await rollDice();
            displayRoll(result);
        } catch (error) {
            console.error(error);
            document.getElementById("result").textContent = "Something went wrong.";
        }

        button.textContent = "Wait...";
        await sleep(5000);
        button.textContent = "Throw Dice";
        button.disabled = false;

        rolling = false;
    });
}

initialize();
