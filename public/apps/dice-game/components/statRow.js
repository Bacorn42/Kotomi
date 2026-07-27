export function stat(label, value) {
    return `
        <div class="stat-row">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `;
}
