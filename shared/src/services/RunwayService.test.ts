import { RunwayService } from './RunwayService'

describe('RunwayService', () => {
    test('isValidName should validate runway names correctly', () => {
        expect(RunwayService.isValidName("09-27")).toBe(true);
        expect(RunwayService.isValidName("09L-27R")).toBe(true);
        expect(RunwayService.isValidName("09R-27L")).toBe(true);
        expect(RunwayService.isValidName("09C-27C")).toBe(true);
        expect(RunwayService.isValidName("1-19")).toBe(false);
        expect(RunwayService.isValidName("01-19")).toBe(true);
        expect(RunwayService.isValidName("19-37")).toBe(false);
        expect(RunwayService.isValidName("36-18")).toBe(true);
        expect(RunwayService.isValidName("37-19")).toBe(false);
        expect(RunwayService.isValidName("NE-SW")).toBe(true);
        expect(RunwayService.isValidName("N-S")).toBe(true);
        expect(RunwayService.isValidName("NW-SE")).toBe(true);
        expect(RunwayService.isValidName("AB-CE")).toBe(false);
    });

    test('isValidEndNames should validate runway end names correctly', () => {
        expect(RunwayService.isValidEndNames("09", "27")).toBe(true);
        expect(RunwayService.isValidEndNames("09L", "27R")).toBe(true);
        expect(RunwayService.isValidEndNames("09R", "27L")).toBe(true);
        expect(RunwayService.isValidEndNames("09C", "27C")).toBe(true);
        expect(RunwayService.isValidEndNames("NE", "SW")).toBe(true);
        expect(RunwayService.isValidEndNames("SW", "NE")).toBe(true);
        expect(RunwayService.isValidEndNames("N", "S")).toBe(true);
        expect(RunwayService.isValidEndNames("9", "27")).toBe(false);
        expect(RunwayService.isValidEndNames("09X", "27Y")).toBe(false);
        expect(RunwayService.isValidEndNames("00", "18")).toBe(false);
        expect(RunwayService.isValidEndNames("37", "19")).toBe(false);
        // incoherent locations
        expect(RunwayService.isValidEndNames("30C", "18L")).toBe(false);
        expect(RunwayService.isValidEndNames("30R", "18R")).toBe(false);
        // Coherent locations
        expect(RunwayService.isValidEndNames("36C", "18C")).toBe(true);
        expect(RunwayService.isValidEndNames("36R", "18L")).toBe(true);
        expect(RunwayService.isValidEndNames("36L", "18R")).toBe(true);
        // Incohent Cardinals
        expect(RunwayService.isValidEndNames("NE", "SE")).toBe(false);
        expect(RunwayService.isValidEndNames("NE", "W")).toBe(false);
        expect(RunwayService.isValidEndNames("NE", "NW")).toBe(false);
        expect(RunwayService.isValidEndNames("N", "E")).toBe(false);
        expect(RunwayService.isValidEndNames("NE", "NE")).toBe(false);
        // Invalid difference
        expect(RunwayService.isValidEndNames("09", "28")).toBe(false);
    });
});
