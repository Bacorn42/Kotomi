export function createUpgradeCard(upgrade) {
    return `
        <div class="upgrade-card">
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
            <div class="upgrade-price">$${(upgrade.costCents / 100).toFixed(2)}</div>
            ${
                upgrade.purchased
                    ? `<button class="kotomi-button-secondary" disabled>Purchased</button>`
                    : `<button class="kotomi-button upgrade-buy-button" data-id="${upgrade.upgradeId}">Buy</button>`
            }
        </div>
    `;
}
