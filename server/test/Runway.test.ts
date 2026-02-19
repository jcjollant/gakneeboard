import { describe, expect, test } from '@jest/globals'
import { Runway, PatternDirection } from '../backend/models/Runway'

describe('Runway', () => {
    test('Constructor should create a runway with valid coherent ends', () => {
        const rwy = new Runway("09-27", 5000, 100);
        expect(rwy.name).toBe("09-27");
        expect(rwy.ends.length).toBe(2);
        expect(rwy.ends[0].mag).toBe(90);
        expect(rwy.ends[1].mag).toBe(270);
    });

    test('Constructor should handle non-numeric ends (e.g., NE-SW)', () => {
        // NE is not a number, parseInt("NE") is NaN. 
        // checkCoherentEnds should return true if ends are NaN.
        const rwy = new Runway("NE-SW", 5000, 100);
        expect(rwy.name).toBe("NE-SW");
        expect(isNaN(rwy.ends[0].mag)).toBe(true);
        expect(isNaN(rwy.ends[1].mag)).toBe(true);
    });

    test('Constructor should handle mixed ends (though unlikely)', () => {
        const rwy = new Runway("09-SW", 5000, 100);
        expect(rwy.name).toBe("09-SW");
        expect(rwy.ends[0].mag).toBe(90);
        expect(isNaN(rwy.ends[1].mag)).toBe(true);
    });
});
