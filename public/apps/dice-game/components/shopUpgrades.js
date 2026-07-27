import { createUpgradeCard } from "./upgradeCard.js";

export function displayUpgrades(upgrades, onBuy) {
    const container = document.getElementById("shop-upgrades");

    if (!container) {
        return;
    }

    container.innerHTML = upgrades.map((upgrade) => createUpgradeCard(upgrade)).join("");

    container.querySelectorAll(".upgrade-buy-button").forEach((button) => {
        button.addEventListener("click", () => {
            onBuy(button.dataset.id);
        });
    });
}
