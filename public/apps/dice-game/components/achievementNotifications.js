const NOTIFICATION_DURATION_MS = 7000;

export function showAchievementNotifications(achievements) {
    const container = document.getElementById("achievement-notifications");

    if (!container) {
        return;
    }

    for (const achievement of achievements) {
        const notification = document.createElement("div");
        notification.className = "achievement-notification";
        notification.innerHTML = createNotificationHtml(achievement);
        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, NOTIFICATION_DURATION_MS);
    }
}

function createNotificationHtml(achievement) {
    return `
        <img src="/apps/dice-game/assets/achievements/${achievement.Icon}">
        <div>
            <strong>Achievement Unlocked!</strong>
            <div>${achievement.Name}</div>
            <p>${achievement.Description}</p>
        </div>
    `;
}
