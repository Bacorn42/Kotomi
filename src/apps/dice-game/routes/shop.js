const express = require("express");
const { requireLogin } = require("../../../middleware/auth.js");
const itemDefinitionRepository = require("../repositories/itemDefinitionRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const shopService = require("../services/shop.js");
const upgradeRepository = require("../repositories/upgradeRepository.js");
const upgradeService = require("../services/upgrade.js");

const router = express.Router();

router.get("/", requireLogin, (req, res) => {
    const definitions = itemDefinitionRepository.getAllShopItems();
    const inventory = playerItemRepository.getInventory(req.user.UserID);
    const owned = new Set(inventory.map((item) => item.definitionID));

    res.json(
        definitions.map((item) => ({
            definitionId: item.definitionID,
            name: item.name,
            description: item.description,
            icon: item.icon,
            costCents: item.costCents,
            owned: owned.has(item.definitionID),
            effects: itemDefinitionRepository.getDefinitionEffects(item.definitionID),
        })),
    );
});

router.post("/:id/buy", requireLogin, (req, res) => {
    const result = shopService.purchaseItem(req.user.UserID, Number(req.params.id));

    res.json(result);
});

router.get("/upgrades", requireLogin, (req, res) => {
    res.json(upgradeRepository.getAvailableUpgrades(req.user.UserID));
});

router.post("/upgrades/:id/buy", requireLogin, (req, res) => {
    upgradeService.purchaseUpgrade(req.user.UserID, Number(req.params.id));

    res.json({
        success: true,
    });
});

module.exports = router;
