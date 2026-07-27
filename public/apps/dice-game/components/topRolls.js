import { renderDice } from "./diceRenderer.js";

export function displayTopRolls(rolls) {
    const container = document.getElementById("top-rolls");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    rolls.forEach((roll, index) => {
        const item = document.createElement("div");
        item.className = "top-roll";

        item.innerHTML = `
            <div class="roll-rank">
                #${index + 1}
            </div>

            <div class="history-dice"></div>

            <div class="roll-score">
                ${roll.score}
            </div>
        `;

        renderDice(item.querySelector(".history-dice"), roll.dice);

        container.appendChild(item);
    });
}
