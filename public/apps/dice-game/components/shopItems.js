import { createItemCard } from "./itemCard.js";

export function displayShop(items, onBuy) {
    const container = document.getElementById("shop-items");

    if (!container) {
        return;
    }

    container.innerHTML = items
        .map((item) =>
            createItemCard(item, {
                showBuy: true,
            }),
        )
        .join("");

    container.querySelectorAll(".buy-button").forEach((button) => {
        button.addEventListener("click", () => {
            onBuy(button.dataset.id);
        });
    });
}
