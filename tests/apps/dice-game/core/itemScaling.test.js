import { describe, it, expect } from "vitest";
import { scaleEffect } from "../../../../src/apps/dice-game/core/itemScaling.js";

describe("scaleEffect()", () => {
    it("returns a new object", () => {
        const effect = { amount: 10 };

        const scaled = scaleEffect("weight", effect, 2);

        expect(scaled).not.toBe(effect);
        expect(effect.amount).toBe(10);
    });

    it("returns unchanged data when amount is missing", () => {
        const effect = { face: 4 };

        expect(scaleEffect("weight", effect, 2)).toEqual({
            face: 4,
        });
    });

    it("scales additive effects", () => {
        expect(scaleEffect("weight", { amount: 8 }, 1.5)).toEqual({
            amount: 12,
        });
    });

    it("rounds additive effects", () => {
        expect(scaleEffect("weight", { amount: 5 }, 1.25)).toEqual({
            amount: 6,
        });
    });

    it("scales score multipliers from 1", () => {
        expect(scaleEffect("score_multiplier", { amount: 1.5 }, 2)).toEqual({
            amount: 2,
        });
    });

    it("scales money multipliers from 1", () => {
        expect(scaleEffect("money_multiplier", { amount: 1.2 }, 3).amount).toBeCloseTo(1.6);
    });

    it("preserves additional properties", () => {
        expect(
            scaleEffect(
                "weight",
                {
                    face: 6,
                    amount: 4,
                },
                2,
            ),
        ).toEqual({
            face: 6,
            amount: 8,
        });
    });

    it("handles negative additive effects", () => {
        expect(scaleEffect("cooldown", { amount: -1000 }, 2)).toEqual({
            amount: -2000,
        });
    });

    it("does not change a multiplier of 1", () => {
        expect(scaleEffect("score_multiplier", { amount: 1 }, 3)).toEqual({
            amount: 1,
        });
    });

    it("leaves unknown effect types as additive", () => {
        expect(scaleEffect("something_new", { amount: 7 }, 2)).toEqual({
            amount: 14,
        });
    });
});
