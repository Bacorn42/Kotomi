import { initializeKotomiApp, formatUsername } from "/js/kotomi.js";
import {
    getProfile,
    getAchievements,
    getInventory,
    equipItem,
    unequipItem,
} from "./services/profileApi.js";
import { displayPlayerInfo } from "./components/profileHeader.js";
import { displayStats } from "./components/profileStats.js";
import { displayDiceSetup } from "./components/diceSetup.js";
import { displayAchievements } from "./components/achievementList.js";
import { displayInventory } from "./components/inventory.js";
import { displayTopRolls } from "./components/topRolls.js";

initializeKotomiApp("dice-game");

async function loadProfile() {
    const profile = await getProfile();

    displayPlayerInfo(profile);
    displayStats(profile);
    displayDiceSetup(profile);
    displayTopRolls(profile.topRolls);
}

async function loadAchievements() {
    const data = await getAchievements();
    displayAchievements(data.achievements, data.stats);
}

async function loadItems() {
    const data = await getInventory();
    displayInventory(data.items, data.maxActiveItems, toggleItem);
}

async function toggleItem(button) {
    const id = button.dataset.id;
    const equipped = button.dataset.equipped === "true";

    if (equipped) {
        await unequipItem(id);
    } else {
        await equipItem(id);
    }

    await Promise.all([loadProfile(), loadItems()]);
}

async function initialize() {
    try {
        await Promise.all([loadProfile(), loadAchievements(), loadItems()]);
    } catch (error) {
        console.error("Failed to load profile:", error);
    }
}

initialize();
