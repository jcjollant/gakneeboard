import { describe, test, expect } from '@jest/globals'
import { NavMath } from './NavMath'

describe('NavMath', () => {
    test('calculateGroundSpeed should handle no wind', () => {
        expect(NavMath.calculateGroundSpeed(100, 360, 0, 0)).toBe(100);
        expect(NavMath.calculateGroundSpeed(120, 90, 270, 0)).toBe(120);
    });

    test('calculateGroundSpeed should handle pure headwind', () => {
        expect(NavMath.calculateGroundSpeed(100, 360, 360, 20)).toBe(80);
        expect(NavMath.calculateGroundSpeed(150, 180, 180, 50)).toBe(100);
    });

    test('calculateGroundSpeed should handle pure tailwind', () => {
        expect(NavMath.calculateGroundSpeed(100, 360, 180, 20)).toBe(120);
        expect(NavMath.calculateGroundSpeed(150, 270, 0, 0)).toBe(150); // sanity check
        expect(NavMath.calculateGroundSpeed(150, 270, 90, 50)).toBe(200);
    });

    test('calculateGroundSpeed should handle 90 degree crosswind', () => {
        // TAS 100, Heading 360, Wind 090@20 -> GS approx 102
        expect(NavMath.calculateGroundSpeed(100, 360, 90, 20)).toBe(102);
        // TAS 100, Heading 0, Wind 270@20 -> GS approx 102
        expect(NavMath.calculateGroundSpeed(100, 0, 270, 20)).toBe(102);
    });

    test('calculateGroundSpeed should handle complex wind', () => {
        // TAS 120, Heading 045, Wind 010@30
        // Rad: 45, WindTowards: 190
        // tasX = 120 * sin(45) = 84.85
        // tasY = 120 * cos(45) = 84.85
        // windX = 30 * sin(190) = -5.21
        // windY = 30 * cos(190) = -29.54
        // groundX = 79.64
        // groundY = 55.31
        // GS = sqrt(79.64^2 + 55.31^2) = sqrt(6342 + 3059) = sqrt(9401) = 96.96 -> 97.0
        expect(NavMath.calculateGroundSpeed(120, 45, 10, 30)).toBe(97);
    });
});
