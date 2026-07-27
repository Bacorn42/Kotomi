import { getAchievementProgress } from "../utils/achievementProgress.js";
import { formatDate } from "../utils/formatters.js";

export function displayAchievements(achievements, stats) {
    const container = document.getElementById("achievements");

    if (!container) {
        return;
    }

    const count = document.getElementById("achievement-count");

    if (!count) {
        return;
    }

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    count.textContent = `${unlockedCount} / ${achievements.length} unlocked`;

    container.innerHTML = achievements
        .map((achievement) => createAchievementCard(achievement, stats))
        .join("");
}

function createAchievementCard(achievement, stats) {
    const progress = !achievement.unlocked ? getAchievementProgress(achievement, stats) : null;

    return `
        <div class="achievement ${achievement.unlocked ? "" : "locked"}">
            <img 
                src="/apps/dice-game/assets/achievements/${achievement.icon}"
                alt="${achievement.name}"
            >

            <div class="achievement-name">
                ${achievement.name}
            </div>

            <div class="achievement-tooltip">
                <strong>${achievement.name}</strong>
                <p>${achievement.description}</p>
                 ${
                     achievement.unlocked
                         ? `<p class="achievement-date">
                            Unlocked: ${formatDate(achievement.unlockedDate)}
                           </p>`
                         : `
                            <div class="achievement-progress">
                                <div 
                                    class="achievement-progress-fill"
                                    style="width:${progress.percent}%"
                                ></div>
                            </div>

                            <p class="achievement-progress-text">
                                ${progress.current}/${progress.target}
                            </p>
                        `
                 }
            </div>
        </div>
    `;
}
