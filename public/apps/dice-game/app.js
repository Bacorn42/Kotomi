import { initializeKotomiApp } from "/js/kotomi.js";

initializeKotomiApp("dice-game");

async function initialize() {
    const button = document.getElementById("rollButton");
    const result = document.getElementById("result");

    button.addEventListener("click", () => {
        result.textContent = "Rolling will be implemented soon!";
    });
}

initialize();
