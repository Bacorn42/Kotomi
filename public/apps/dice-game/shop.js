import { initializeKotomiApp } from "/js/kotomi.js";
import { createItemCard } from "./components/itemCard.js";
import { createUpgradeCard } from "./components/upgradeCard.js";

initializeKotomiApp("dice-game");

await loadShop();

async function loadShop() {
    const [shopResponse, profileResponse, upgradesResponse] = await Promise.all([
        fetch("/api/shop"),
        fetch("/api/dice/profile"),
        fetch("/api/shop/upgrades"),
    ]);

    const items = await shopResponse.json();
    const profile = await profileResponse.json();
    const upgrades = await upgradesResponse.json();
    console.log(items);

    displayMoney(profile.moneyCents);
    displayShop(items);
    displayUpgrades(upgrades);
}

function displayMoney(moneyCents) {
    document.getElementById("shop-money").innerHTML = `
        <h2>Balance</h2>

        <div class="shop-money">
            $${(moneyCents / 100).toFixed(2)}
        </div>
    `;
}

function displayShop(items) {
    const container = document.getElementById("shop-items");

    container.innerHTML = items
        .map((item) =>
            createItemCard(item, {
                showBuy: true,
            }),
        )
        .join("");

    document.querySelectorAll(".buy-button").forEach((button) => {
        button.addEventListener("click", () => buyItem(button.dataset.id));
    });
}

async function buyItem(definitionId) {
    const response = await fetch(`/api/shop/${definitionId}/buy`, {
        method: "POST",
    });

    const result = await response.json();

    if (!result.success) {
        alert(result.message);
        return;
    }

    await loadShop();
}

function displayUpgrades(upgrades) {
    const container = document.getElementById("shop-upgrades");
    container.innerHTML = upgrades.map((upgrade) => createUpgradeCard(upgrade)).join("");

    document.querySelectorAll(".upgrade-buy-button").forEach((button) => {
        button.addEventListener("click", () => buyUpgrade(button.dataset.id));
    });
}

async function buyUpgrade(id) {
    await fetch(`/api/shop/upgrades/${id}/buy`, {
        method: "POST",
    });

    await loadShop();
}
