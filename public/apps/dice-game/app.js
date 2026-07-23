import { initializeKotomiApp } from "/js/kotomi.js";

initializeKotomiApp("dice-game");

async function rollDice() {
    const response = await fetch("/api/dice/roll", {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Failed to roll dice");
    }

    return await response.json();
}

function displayRoll(result) {
    const resultElement = document.getElementById("result");

    resultElement.innerHTML = `
        <div class="dice-result">
            <h3>Your Roll</h3>
            <div class="dice-values">
                ${result.dice.map((value) => `<span class="die">${value}</span>`).join("")}
            </div>
            <h3>Score: ${result.score}</h3>
        </div>
    `;
}

async function initialize() {
    const button = document.getElementById("rollButton");

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Rolling...";

        try {
            const result = await rollDice();
            displayRoll(result);
        } catch (error) {
            console.error(error);
            document.getElementById("result").textContent =
                "Something went wrong rolling the dice.";
        } finally {
            button.disabled = false;
            button.textContent = "Throw Dice";
        }
    });
}

initialize();
