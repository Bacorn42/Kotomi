import { describe, it, expect, vi, afterEach } from "vitest";
import { rollDice } from "../../../../src/apps/dice-game/core/roller.js";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("rollDice()", () => {
    it("returns the requested number of dice", () => {
        const dice = rollDice({
            diceCount: 8,
            weights: [1, 1, 1, 1, 1, 1],
        });

        expect(dice).toHaveLength(8);
    });

    it("returns only valid face values", () => {
        const dice = rollDice({
            diceCount: 100,
            weights: [1, 1, 1, 1, 1, 1],
        });

        for (const face of dice) {
            expect(face).toBeGreaterThanOrEqual(1);
            expect(face).toBeLessThanOrEqual(6);
        }
    });

    it("returns the first face when Math.random() is 0", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        const [face] = rollDice({
            diceCount: 1,
            weights: [10, 10, 10, 10, 10, 10],
        });

        expect(face).toBe(1);
    });

    it("returns the last face when Math.random() is very close to 1", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.999999);

        const [face] = rollDice({
            diceCount: 1,
            weights: [10, 10, 10, 10, 10, 10],
        });

        expect(face).toBe(6);
    });

    it("throws when all weights are zero", () => {
        expect(() =>
            rollDice({
                diceCount: 1,
                weights: [0, 0, 0, 0, 0, 0],
            }),
        ).toThrow("Invalid dice weights");
    });

    it("always rolls the only weighted face", () => {
        const dice = rollDice({
            diceCount: 20,
            weights: [0, 0, 5, 0, 0, 0],
        });

        expect(dice.every((face) => face === 3)).toBe(true);
    });

    it("roughly follows the configured distribution", () => {
        const dice = rollDice({
            diceCount: 10000,
            weights: [60, 50, 40, 30, 20, 10],
        });

        const counts = [0, 0, 0, 0, 0, 0];

        for (const face of dice) {
            counts[face - 1]++;
        }

        expect(counts[0]).toBeGreaterThan(counts[1]);
        expect(counts[1]).toBeGreaterThan(counts[2]);
        expect(counts[2]).toBeGreaterThan(counts[3]);
        expect(counts[3]).toBeGreaterThan(counts[4]);
        expect(counts[4]).toBeGreaterThan(counts[5]);
    });
});
