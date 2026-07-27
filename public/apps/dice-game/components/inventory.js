import { createItemCard } from "./itemCard.js";

export function displayInventory(items, maxActiveItems, onToggle) {
    const container = document.getElementById("items");
    const equipped = items.filter((item) => item.equipped);

    container.innerHTML = `
        <div class="equipped-items">
            <h3>Active Items (${equipped.length}/${maxActiveItems})</h3>
            <div class="active-item-list">
                ${
                    equipped.length
                        ? equipped
                              .map(
                                  (item) => `
                            <div class="active-item">
                                <img src="/apps/dice-game/assets/items/${item.icon}">
                                <span>${item.name}</span>
                            </div>
                        `,
                              )
                              .join("")
                        : "<p>No active items</p>"
                }
            </div>
        </div>
        <h3>Inventory</h3>
        <div class="item-grid">
            ${items
                .map((item) =>
                    createItemCard(item, {
                        showEquip: true,
                    }),
                )
                .join("")}
        </div>
    `;

    document.querySelectorAll(".item-toggle").forEach((button) => {
        button.addEventListener("click", () => onToggle(button));
    });
}
