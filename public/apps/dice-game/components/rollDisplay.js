import { renderDice } from "./diceRenderer.js";
import { formatMoney } from "../utils/formatters.js";

export function displayRoll(result) {
    const resultElement = document.getElementById("result");

    if (!resultElement) {
        return;
    }

    resultElement.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Your Roll";

    const diceContainer = document.createElement("div");
    diceContainer.className = "dice-values";
    renderDice(diceContainer, result.dice);

    const score = document.createElement("h3");
    score.textContent = `Score: ${result.score}`;
    if (result.moneyCents > 0) {
        score.textContent += ` (+${formatMoney(result.moneyCents)})`;
    }

    resultElement.appendChild(title);
    resultElement.appendChild(diceContainer);
    resultElement.appendChild(score);
}

export function showRollingAnimation(diceCount) {
    const resultElement = document.getElementById("result");

    if (!resultElement) {
        return;
    }

    resultElement.innerHTML = "";

    const diceContainer = document.createElement("div");
    diceContainer.className = "dice-values";

    for (let i = 0; i < diceCount; i++) {
        const die = createDie(Math.floor(Math.random() * 6) + 1, true);
        diceContainer.appendChild(die);
    }

    resultElement.appendChild(diceContainer);
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

function getDieImage(value) {
    return `/apps/dice-game/assets/dice/classic/die-classic-${value}.png`;
}
