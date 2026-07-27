import { formatMoney } from "../utils/formatters.js";

export function createUpgradeCard(upgrade) {
    const button = upgrade.purchased
        ? `<button class="kotomi-button-secondary" disabled>Purchased</button>`
        : `<button class="kotomi-button upgrade-buy-button" data-id="${upgrade.upgradeId}">Buy</button>`;

    return `
        <div class="upgrade-card">
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
            <div class="upgrade-price">${formatMoney(upgrade.costCents)}</div>
            ${button}
        </div>
    `;
}
