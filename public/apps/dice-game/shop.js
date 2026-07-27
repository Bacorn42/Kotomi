import { initializeKotomiApp } from "/js/kotomi.js";
import {
    getShopItems,
    getShopUpgrades,
    getPlayerProfile,
    buyItem as apiBuyItem,
    buyUpgrade as apiBuyUpgrade,
} from "./services/shopApi.js";
import { displayMoney } from "./components/shopBalance.js";
import { displayShop } from "./components/shopItems.js";
import { displayUpgrades } from "./components/shopUpgrades.js";

initializeKotomiApp("dice-game");

await loadShop();

async function loadShop() {
    const [items, profile, upgrades] = await Promise.all([
        getShopItems(),
        getPlayerProfile(),
        getShopUpgrades(),
    ]);

    displayMoney(profile.moneyCents);
    displayShop(items, buyItem);
    displayUpgrades(upgrades, buyUpgrade);
}

async function buyItem(id) {
    const result = await apiBuyItem(id);

    if (!result.success) {
        alert(result.message);
        return;
    }

    await loadShop();
}

async function buyUpgrade(id) {
    const result = await apiBuyUpgrade(id);

    if (!result.success) {
        alert(result.message);
        return;
    }

    await loadShop();
}

async function initialize() {
    try {
        await loadShop();
    } catch (error) {
        console.error("Failed to load shop:", error);
    }
}

initialize();
