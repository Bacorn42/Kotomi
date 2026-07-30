const express = require("express");
const { requireLogin } = require("../../../middleware/auth.js");
const playerRepository = require("../repositories/playerRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const itemDefinitionRepository = require("../repositories/itemDefinitionRepository.js");
const itemService = require("../services/item.js");

const router = express.Router();

router.get("/inventory", requireLogin, (req, res) => {
    const userId = req.user.UserID;
    const player = playerRepository.getPlayer(userId);
    const items = playerItemRepository.getInventory(userId);

    const inventory = items
        .map((item) => {
            const definition = itemDefinitionRepository.getById(item.definitionId);

            if (!definition) {
                return null;
            }

            const effects = playerItemRepository.getItemEffects(item.playerItemId);

            return {
                playerItemId: item.playerItemId,
                name: item.generatedName || definition.name,
                description: definition.description,
                icon: definition.icon,
                rarity: item.rarity,
                equipped: item.equipped,
                effects,
            };
        })
        .filter(Boolean);

    console.log(inventory);

    res.json({
        maxActiveItems: player.maxActiveItems,
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
