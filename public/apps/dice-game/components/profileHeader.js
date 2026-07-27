import { formatUsername } from "/js/kotomi.js";
import { formatDate } from "../utils/formatters.js";

export function displayPlayerInfo(profile) {
    document.getElementById("player-info").innerHTML = `
        <div class="profile-player">
            <div class="profile-avatar">🎲</div>
            <div>
                <h2>${formatUsername(profile.username)}</h2>
                <p>Member since ${formatDate(profile.createdDate)}</p>
            </div>
        </div>
    `;
}
