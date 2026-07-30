import { describe, it, expect, vi, afterEach } from "vitest";
import { getRandomRarity } from "../../../../src/apps/dice-game/core/rarity.js";
import rarities from "../../../../src/apps/dice-game/constants/rarities.js";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("getRandomRarity()", () => {
    it("returns Common", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.0);

        expect(getRandomRarity()).toStrictEqual(rarities.COMMON);
    });

    it("returns Uncommon", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.75);

        expect(getRandomRarity()).toStrictEqual(rarities.UNCOMMON);
    });

    it("returns Rare", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.92);

        expect(getRandomRarity()).toStrictEqual(rarities.RARE);
    });

    it("returns Epic", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.98);

        expect(getRandomRarity()).toStrictEqual(rarities.EPIC);
    });

    it("returns Legendary", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.9999);

        expect(getRandomRarity()).toStrictEqual(rarities.LEGENDARY);
    });

    it("returns Legendary when roll reaches the end of the table", () => {
        vi.spyOn(Math, "random").mockReturnValue(1);

        expect(getRandomRarity()).toStrictEqual(rarities.LEGENDARY);
    });

    it("rarity chances sum to 1", () => {
        const total = rarities.list.reduce((sum, rarity) => sum + rarity.chance, 0);

        expect(total).toBeCloseTo(1);
    });
});
