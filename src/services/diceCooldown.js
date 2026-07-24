function canRoll(player, cooldownMs) {
    if (!player.LastRollTime) {
        return true;
    }

    const lastRoll = new Date(player.LastRollTime.replace(" ", "T") + "Z").getTime();
    const now = Date.now();

    return now - lastRoll >= cooldownMs;
}

function getRemainingCooldown(player, cooldownMs) {
    if (!player.LastRollTime) {
        return 0;
    }

    const lastRoll = new Date(player.LastRollTime.replace(" ", "T") + "Z").getTime();
    const elapsed = Date.now() - lastRoll;

    return Math.max(0, cooldownMs - elapsed);
}

module.exports = {
    canRoll,
    getRemainingCooldown,
};
