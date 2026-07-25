export function formatEffect(effect) {
    const data = effect.effectData ?? effect.data;

    switch (effect.effectType ?? effect.type) {
        case "weight":
            return formatWeight(data);
        case "dice_count":
            return formatDiceCount(data);
        case "cooldown":
            return formatCooldown(data);
        default:
            return "Unknown effect";
    }
}

function formatWeight(data) {
    const sign = data.amount >= 0 ? "+" : "";

    return `${sign}${data.amount} weight to ${data.face}s`;
}

function formatDiceCount(data) {
    const sign = data.amount >= 0 ? "+" : "";
    const word = Math.abs(data.amount) === 1 ? "die" : "dice";

    return `${sign}${data.amount} ${word}`;
}

function formatCooldown(data) {
    if (data.amount < 0) {
        return `${Math.abs(data.amount)}ms faster rolls`;
    }

    return `${data.amount}ms slower rolls`;
}
