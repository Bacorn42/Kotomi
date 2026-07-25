import { initializeKotomiApp } from "/js/kotomi.js";
import { createItemCard } from "./components/itemCard.js";

initializeKotomiApp("dice-game");

await loadShop();

async function loadShop() {
    const [shopResponse, profileResponse] = await Promise.all([
        fetch("/api/shop"),
        fetch("/api/dice/profile"),
    ]);

    const items = await shopResponse.json();
    const profile = await profileResponse.json();

    displayMoney(profile.moneyCents);
    displayShop(items);
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
