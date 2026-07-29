const items = require("./itemDefinitions.js");
const repository = require("../repositories/itemDefinitionRepository.js");

function seedItems() {
    for (const item of items) {
        if (repository.exists(item.name)) {
            continue;
        }

        repository.createDefinition(item);
        console.log(`Seeded item: ${item.name}`);
    }
}

module.exports = seedItems;
