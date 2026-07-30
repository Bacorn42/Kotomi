import { describe, it, expect } from "vitest";
import { calculateScore, calculateMoney } from "../../../../src/apps/dice-game/core/calculation.js";

describe("calculateScore()", () => {
    it("counts ones normally", () => {
        expect(calculateScore([1, 1, 1], 1)).toBe(3);
    });

    it("raises duplicate faces to their count", () => {
        expect(calculateScore([2, 2, 2], 1)).toBe(8);
    });

    it("handles mixed dice", () => {
        expect(calculateScore([1, 2, 2, 5], 1)).toBe(10);
    });

    it("calculates score correctly for multiple repeated faces", () => {
        expect(calculateScore([1, 1, 1, 2, 3, 3, 3, 3, 4, 4, 5, 6, 6], 1)).toBe(143);
    });

    it("applies multiplier", () => {
        expect(calculateScore([2, 2], 2)).toBe(8);
    });

    it("applies fractional multiplier", () => {
        expect(calculateScore([3, 3], 1.5)).toBe(14);
    });
});

describe("calculateMoney()", () => {
    it("returns zero below threshold", () => {
        expect(calculateMoney(99, 1)).toBe(0);
    });

    it("returns money at threshold", () => {
        expect(calculateMoney(100, 1)).toBeGreaterThan(0);
    });

    it("returns 1 cent for score of 100", () => {
        expect(calculateMoney(100, 1)).toBe(1);
    });

    it("returns 10000 cents for score of 1000000", () => {
        expect(calculateMoney(1000000, 1)).toBe(10000);
    });

    it("applies multiplier", () => {
        const normal = calculateMoney(10000, 1);
        const doubled = calculateMoney(10000, 2);

        expect(doubled).toBeGreaterThan(normal);
        expect(doubled).toBeGreaterThanOrEqual(normal * 2 - 1);
        expect(doubled).toBeLessThanOrEqual(normal * 2 + 1);
    });

    it("applies fractional multiplier", () => {
        const normal = calculateMoney(10000, 1);
        const fractional = calculateMoney(10000, 1.5);

        expect(fractional).toBeGreaterThan(normal);
        expect(fractional).toBeGreaterThanOrEqual(normal * 1.5 - 1);
        expect(fractional).toBeLessThanOrEqual(normal * 1.5 + 1);
    });
});
