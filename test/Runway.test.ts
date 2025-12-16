
import { describe, expect, test } from '@jest/globals';
import { PatternDirection, Runway } from '../backend/models/Runway';

describe('Runway Tests', () => {

    test('Runway Name Validation', () => {
        // Valid names
        expect(Runway.isValidName('16-34')).toBe(true)
        expect(Runway.isValidName('16/34')).toBe(true)
        expect(Runway.isValidName('01-19')).toBe(true)
        expect(Runway.isValidName('36L-18R')).toBe(true)
        expect(Runway.isValidName('01C/19C')).toBe(true)

        // Invalid names (format)
        expect(Runway.isValidName('16')).toBe(false)
        expect(Runway.isValidName('16-34-12')).toBe(false)
        expect(Runway.isValidName('00-18')).toBe(false) // 00 is invalid
        expect(Runway.isValidName('37-19')).toBe(false) // 37 is invalid
        expect(Runway.isValidName('16X-34X')).toBe(false) // Invalid char
    })

    test('Runway Constructor with dash', () => {
        const rwy = new Runway('16-34', 5000, 100)
        expect(rwy.name).toBe('16-34')
        expect(rwy.length).toBe(5000)
        expect(rwy.width).toBe(100)
        expect(rwy.ends.length).toBe(2)
        expect(rwy.ends[0].name).toBe('16')
        expect(rwy.ends[0].mag).toBe(160)
        expect(rwy.ends[1].name).toBe('34')
        expect(rwy.ends[1].mag).toBe(340)
    })

    test('Magnetic ends with complex runway names', () => {
        const rwy = new Runway('16C-34C', 5000, 100)
        expect(rwy.ends[0].mag).toBe(160)
        expect(rwy.ends[1].mag).toBe(340)
    })

    test('Runway creation should fail with invalid ends', () => {
        expect(() => new Runway('16-17', 5000, 100)).toThrow()
    })

    test('Runway Constructor with slash', () => {
        const rwy = new Runway('16/34', 5000, 100)
        expect(rwy.name).toBe('16/34')
        expect(rwy.ends.length).toBe(2)
        expect(rwy.ends[0].name).toBe('16')
        expect(rwy.ends[1].name).toBe('34')
    })

    test('Runway Ends Parsing', () => {
        const rwy = new Runway('18R-36L', 10000, 150)
        expect(rwy.ends[0].name).toBe('18R')
        expect(rwy.ends[1].name).toBe('36L')

        // Check orientation parsing logic (parseInt('18R') * 10) -> 180
        // Although the constructor logic `parseInt(end) * 10` is simple, let's verify it works for alpha-suffixed names
        expect(rwy.ends[0].mag).toBe(180)
        expect(rwy.ends[1].mag).toBe(360 % 360) // 360 % 360 = 0
    })

    test('Runway Traffic Pattern', () => {
        // Test underlying RunwayEnd/PatternDirection logic if exposed
        const rwy = new Runway('16-34', 4000, 75)
        // Default might be Left if not specified or RP

        // Manually set traffic pattern
        rwy.setTrafficPattern('16', PatternDirection.Right)
        expect(rwy.getTrafficPattern('16')).toBe(PatternDirection.Right)

        // Default check (RunwayEnd constructor sets Left unless starts with RP, but Runway constructor passes clean name)
        // Actually looking at Runway.ts:61: ends.map((end) => new RunwayEnd(end, ...))
        // So they are initialized with just "16" etc, so they should be Left by default.
        expect(rwy.getTrafficPattern('34')).toBe(PatternDirection.Left)
    })

})
