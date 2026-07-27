export function displayDiceSetup(profile) {
    document.getElementById("dice-setup").innerHTML = `
        <div class="stat-row">
            <span>Dice</span>
            <strong>${profile.diceCount}</strong>
        </div>

        <div class="stat-row">
            <span>Cooldown</span>
            <strong>${(profile.cooldownMs / 1000).toFixed(1)}s</strong>
        </div>

        <h3>Weights</h3>

        <table class="weights-table">
            <thead>
                <tr>
                    <th>Value</th>
                    ${profile.weights.map((_, index) => `<th>${index + 1}</th>`).join("")}
                </tr>
            </thead>

            <tbody>
                <tr>
                    <th>Weight</th>
                    ${profile.weights.map((weight) => `<td>${weight}</td>`).join("")}
                </tr>
            </tbody>
        </table>
    `;
}
