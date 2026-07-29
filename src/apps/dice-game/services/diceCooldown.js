function canRoll(player, cooldownMs) {
    const lastRoll = getLastRollTimestamp(player);

    if (!lastRoll) {
        return true;
    }

    return Date.now() - lastRoll >= cooldownMs;
}

function getRemainingCooldown(player, cooldownMs) {
    const lastRoll = getLastRollTimestamp(player);

    if (!lastRoll) {
        return 0;
    }

    const elapsed = Date.now() - lastRoll;

    return Math.max(0, cooldownMs - elapsed);
}

function getLastRollTimestamp(player) {
    if (!player.lastRollTime) {
        return null;
    }

    return new Date(player.lastRollTime.replace(" ", "T") + "Z").getTime();
}

module.exports = {
    canRoll,
    getRemainingCooldown,
};
