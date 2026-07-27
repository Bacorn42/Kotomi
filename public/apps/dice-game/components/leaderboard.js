import { formatUsername } from "/js/kotomi.js";
import { formatMoney } from "../utils/formatters.js";

export function displayLeaderboard(id, entries, valueKey, options = {}) {
    const container = document.getElementById(id);

    if (!entries.length) {
        container.innerHTML = "<p>No data yet.</p>";
        return;
    }

    container.innerHTML = entries
        .map(
            (entry, index) => `
                <div class="stat-row">
                    <span>
                        #${index + 1} ${formatUsername(entry.Username)}
                    </span>

                    <strong>
                        ${options.currency ? formatMoney(entry[valueKey]) : entry[valueKey]}
                    </strong>
                </div>
            `,
        )
        .join("");
}
