import { initializeKotomiApp } from "/js/kotomi.js";
import { rollDice, getPlayerProfile } from "./services/diceApi.js";
import { initializeLiveFeed } from "./components/liveFeed.js";
import { displayRoll, showRollingAnimation } from "./components/rollDisplay.js";
import { handleRewards } from "./components/rewards.js";

initializeKotomiApp("dice-game");

const socket = io();
initializeLiveFeed(socket);

let rolling = false;
let cooldownInterval = null;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initialize() {
    const profile = await getPlayerProfile();
    const button = document.getElementById("rollButton");

    button.addEventListener("click", async () => {
        if (rolling) {
            return;
        }

        rolling = true;

        button.disabled = true;
        showRollingAnimation(profile.diceCount);
        button.textContent = "Rolling...";

        const startTimestamp = Date.now();

        try {
            const result = await rollDice();
            await sleep(1000);
            displayRoll(result);
            handleRewards(result);
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

initialize();
