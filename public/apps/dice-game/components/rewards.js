import { showAchievementNotifications } from "./achievementNotifications.js";
import { showItemDrop } from "./itemNotifications.js";

export function handleRewards(result) {
    if (!result) {
        return;
    }

    if (result.unlockedAchievements?.length) {
        showAchievementNotifications(result.unlockedAchievements);
    }

    if (result.droppedItem) {
        showItemDrop(result.droppedItem);
    }
}
