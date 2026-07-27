import { formatMoney } from "../utils/formatters.js";

export function displayMoney(moneyCents) {
    const container = document.getElementById("shop-money");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <h2>Balance</h2>

        <div class="shop-money">
            ${formatMoney(moneyCents)}
        </div>
    `;
}
