import { formatPercentage, formatSigned } from "../utils/formatters.js";

export function formatEffect(effect) {
    const value = effect.effectData ?? effect.data;
    const type = effect.effectType ?? effect.type;

    switch (type) {
        case "weight":
            return formatWeight(value);
        case "dice_count":
            return formatDiceCount(value);
        case "cooldown":
            return formatCooldown(value);
        case "score_multiplier":
            return formatScoreMultiplier(value);
        case "money_multiplier":
            return formatMoneyMultiplier(value);
        case "score_bonus":
            return formatScoreBonus(value);
        case "drop_multiplier":
            return formatDropMultiplier(value);
        default:
            return "Unknown effect";
    }
}

function formatWeight(data) {
    return `${formatSigned(data.amount)} weight to ${data.face}s`;
}

function formatDiceCount(data) {
    const word = Math.abs(data.amount) === 1 ? "die" : "dice";
    return `${formatSigned(data.amount)} ${word}`;
}

function formatCooldown(data) {
    if (data.amount < 0) {
        return `${Math.abs(data.amount)}ms faster rolls`;
    }

    return `${data.amount}ms slower rolls`;
}

function formatScoreMultiplier(data) {
    return `${formatPercentage(data.amount)} score`;
}

function formatMoneyMultiplier(data) {
    return `${formatPercentage(data.amount)} money`;
}

function formatScoreBonus(data) {
    return `${formatSigned(data.amount)} score`;
}

function formatDropMultiplier(data) {
    return `${formatPercentage(data.amount)} loot chance`;
}
