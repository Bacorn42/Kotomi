export function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

export function formatDate(date) {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleDateString();
}

export function formatPercentage(multiplier) {
    const percent = Number(((multiplier - 1) * 100).toFixed(2));
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
}

export function formatSigned(value) {
    return value >= 0 ? `+${value}` : `${value}`;
}

export function formatNumber(value) {
    return Number(value).toFixed(2);
}
