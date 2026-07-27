export function renderDice(container, dice, options = {}) {
    const { skin = "classic", clear = true } = options;

    if (clear) {
        container.innerHTML = "";
    }

    const sortedDice = dice.toSorted((a, b) => a - b);

    let previousFace = null;

    for (const face of sortedDice) {
        if (previousFace !== null && previousFace !== face) {
            const gap = document.createElement("div");
            gap.className = "dice-group-gap";

            container.appendChild(gap);
        }

        const image = document.createElement("img");
        image.src = getDieImage(skin, face);
        image.alt = `Die ${face}`;

        container.appendChild(image);

        previousFace = face;
    }
}

function getDieImage(skin, value) {
    return `/apps/dice-game/assets/dice/${skin}/die-${skin}-${value}.png`;
}
