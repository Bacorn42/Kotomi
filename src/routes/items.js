const express = require("express");
const { requireLogin } = require("../middleware/auth.js");
const playerRepository = require("../repositories/playerRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const itemDefinitionRepository = require("../repositories/itemDefinitionRepository.js");
const itemService = require("../services/item.js");

const router = express.Router();

router.get("/inventory", requireLogin, (req, res) => {
    const userId = req.user.UserID;
    const player = playerRepository.getPlayer(req.user.UserID);
    const items = playerItemRepository.getInventory(userId);

    const inventory = items.map((item) => {
        const definition = itemDefinitionRepository.getById(item.DefinitionID);
        const effects = playerItemRepository.getEffects(item.PlayerItemID);

        return {
            playerItemId: item.PlayerItemID,
            name: item.GeneratedName || definition.Name,
            description: definition.Description,
            icon: definition.Icon,
            rarity: item.Rarity,
            equipped: Boolean(item.IsEquipped),
            effects,
        };
    });

    res.json({
        maxActiveItems: player.MaxActiveItems,
        items: inventory,
    });
});

router.post("/:id/equip", requireLogin, (req, res) => {
    const result = itemService.equipItem(req.user.UserID, Number(req.params.id));

    res.json(result);
});

router.post("/:id/unequip", requireLogin, (req, res) => {
    const result = itemService.unequipItem(req.user.UserID, Number(req.params.id));

    res.json(result);
});

module.exports = router;
