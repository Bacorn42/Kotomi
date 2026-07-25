const express = require("express");
const { requireLogin } = require("../middleware/auth.js");
const itemDefinitionRepository = require("../repositories/itemDefinitionRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");

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
        })),
    );
});

module.exports = router;
