async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed: ${url}`);
    }

    return await response.json();
}

export function getProfile() {
    return fetchJson("/api/dice/profile");
}

export function getAchievements() {
    return fetchJson("/api/achievements");
}

export function getInventory() {
    return fetchJson("/api/items/inventory");
}

export function equipItem(id) {
    return fetch(`/api/items/${id}/equip`, {
        method: "POST",
    });
}

export function unequipItem(id) {
    return fetch(`/api/items/${id}/unequip`, {
        method: "POST",
    });
}
