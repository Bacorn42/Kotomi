export async function getShopItems() {
    const response = await fetch("/api/shop");

    return await response.json();
}

export async function getShopUpgrades() {
    const response = await fetch("/api/shop/upgrades");

    return await response.json();
}

export async function getPlayerProfile() {
    const response = await fetch("/api/dice/profile");

    return await response.json();
}

export async function buyItem(definitionId) {
    const response = await fetch(`/api/shop/${definitionId}/buy`, {
        method: "POST",
    });

    return await response.json();
}

export async function buyUpgrade(id) {
    const response = await fetch(`/api/shop/upgrades/${id}/buy`, {
        method: "POST",
    });

    return await response.json();
}
