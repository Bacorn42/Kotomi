const express = require("express");
const { requireLogin } = require("../middleware/auth.js");
const itemDefinitionRepository = require("../repositories/itemDefinitionRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const shopService = require("../services/shop.js");
const upgradeRepository = require("../repositories/upgradeRepository.js");

const router = express.Router();

router.get("/", requireLogin, (req, res) => {
    const definitions = itemDefinitionRepository.getAll();
    const inventory = playerItemRepository.getInventory(req.user.UserID);
    const owned = new Set(inventory.map((item) => item.DefinitionID));

    res.json(
        definitions.map((item) => ({
            definitionId: item.DefinitionID,
            name: item.Name,
            description: item.Description,
            icon: item.Icon,
            costCents: item.CostCents,
            owned: owned.has(item.DefinitionID),
            effects: itemDefinitionRepository.getEffects(item.DefinitionID),
        })),
    );
});

router.post("/:id/buy", requireLogin, (req, res) => {
    const result = shopService.buyItem(req.user.UserID, Number(req.params.id));

    res.json(result);
});

router.get("/upgrades", requireLogin, (req, res) => {
    res.json(upgradeRepository.getAvailableUpgrades(req.user.UserID));
});

router.post("/upgrades/:id/buy", requireLogin, (req, res) => {
    upgradeRepository.purchaseUpgrade(req.user.UserID, Number(req.params.id));

    res.json({
        success: true,
    });
});

module.exports = router;
