import { initializeKotomiApp } from "/js/kotomi.js";

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
    container.innerHTML = items.map(createItemCard).join("");

    document.querySelectorAll(".buy-button").forEach((button) => {
        button.addEventListener("click", () => buyItem(button.dataset.id));
    });
}

function createItemCard(item) {
    return `
        <div class="item-card">
            <img src="/apps/dice-game/assets/items/${item.icon}" class="item-icon">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="item-price">$${(item.costCents / 100).toFixed(2)}</div>
            ${
                item.owned
                    ? `<button class="kotomi-button-secondary" disabled>Owned</button>`
                    : `<button class="kotomi-button buy-button" data-id="${item.definitionId}">Buy</button>`
            }
        </div>
    `;
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
