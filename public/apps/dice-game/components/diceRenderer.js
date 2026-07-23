export function renderDice(container, dice, options = {}) {
    const { skin = "classic", clear = true } = options;

    if (clear) {
        container.innerHTML = "";
    }

    const sortedDice = [...dice].sort((a, b) => a - b);

    let previousValue = null;

    for (const value of sortedDice) {
        if (previousValue !== null && previousValue !== value) {
            const gap = document.createElement("div");
            gap.className = "dice-group-gap";

            container.appendChild(gap);
        }

        const image = document.createElement("img");
        image.src = `/apps/dice-game/assets/dice/${skin}/die-${skin}-${value}.png`;
        image.alt = `Die ${value}`;

        container.appendChild(image);

        previousValue = value;
    }
}
