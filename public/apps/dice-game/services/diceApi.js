export async function rollDice() {
    const response = await fetch("/api/dice/roll", {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Failed to roll dice");
    }

    return await response.json();
}

export async function getPlayerProfile() {
    const response = await fetch("/api/dice/profile");

    if (!response.ok) {
        throw new Error("Failed to load profile");
    }

    return await response.json();
}
