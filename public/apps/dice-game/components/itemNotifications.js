import { formatEffect } from "./itemFormatter.js";

const NOTIFICATION_DURATION_MS = 7000;

export function showItemDrop(item) {
    const container = document.getElementById("item-notifications");
    const notification = document.createElement("div");
    notification.className = `item-notification ${item.rarity.toLowerCase()}`;
    notification.innerHTML = createNotificationHtml(item);
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, NOTIFICATION_DURATION_MS);
}

function createNotificationHtml(item) {
    const effects = (item.effects ?? []).map((effect) => `<p>${formatEffect(effect)}</p>`).join("");

    return `
        <img src="/apps/dice-game/assets/items/${item.icon}">
        <div>
            <strong>${item.name}</strong>
            <p class="item-rarity">${item.rarity}</p>
            ${effects}
            <p>✨ New item discovered!</p>
        </div>
    `;
}
