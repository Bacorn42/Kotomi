import { formatEffect } from "./itemFormatter.js";

export function showItemDrop(item) {
    const container = document.getElementById("item-notifications");
    const notification = document.createElement("div");
    notification.className = `item-notification ${item.rarity.toLowerCase()}`;

    const effects = item.effects.map((effect) => `<p>${formatEffect(effect)}</p>`).join("");

    notification.innerHTML = `
        <img src="assets/items/${item.icon}">
        <div>
            <strong>${item.name}</strong>
            <p class="item-rarity">${item.rarity}</p>
            ${effects}
            <p>✨ New item discovered!</p>
        </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 7000);
}
