import { formatEffect } from "./itemFormatter.js";
import { formatMoney } from "../utils/formatters.js";

export function createItemCard(item, options = {}) {
    const { showBuy = false, showEquip = false } = options;

    return `
        <div class="item-card ${item.rarity.toLowerCase()}">
            <img src="/apps/dice-game/assets/items/${item.icon}" class="item-icon">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="item-effects">
                <strong>Effects</strong>
                <ul>${createEffects(item)}</ul>
            </div>
            ${createItemActions(item, options)}
        </div>
    `;
}

function createItemActions(item, options) {
    if (options.showBuy) {
        return `
        <div class="item-shop-info">
            <div class="item-price">
                ${formatMoney(item.costCents)}
            </div>
            ${
                item.owned
                    ? `<button class="kotomi-button-secondary" disabled>Owned</button>`
                    : `<button class="kotomi-button buy-button" data-id="${item.definitionId}">Buy</button>`
            }
        </div>
    `;
    }

    if (options.showEquip) {
        return `
            <button class="kotomi-button item-toggle" data-id="${item.playerItemId}" data-equipped="${item.equipped}">
                ${item.equipped ? "Unequip" : "Equip"}
            </button>
        `;
    }

    return "";
}

function createEffects(item) {
    return (item.effects ?? []).map((effect) => `<li>${formatEffect(effect)}</li>`).join("");
}
