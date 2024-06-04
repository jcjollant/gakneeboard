
// import { describe, expect, test } from '@jest/globals';
// require( '../src/assets/Airport'   )
import { Airport, Runway } from "../src/assets/Airport"; 


describe('Airport', () => {
    test ('Airport should be an object', () => {
        const airport = new Airport( "name", "JCJ", 32);
        expect(typeof airport).toBe('object');
        expect(airport.frequencies.length).toBe(0)
        expect(airport.runways.length).toBe(0)
    })

    test('Frequencies', () => {
        const airport = new Airport("name", "JCJ", 32);
        airport.addFrequency("CTAF", 124.7);
        expect(airport.frequencies.length).toBe(1)
    })

    test('Runways', () => {
        const airport = new Airport("name", "JCJ", 32);
        const rwy = new Runway("16-34", 5400, 150)
        expect(rwy.getEnd("16")?.getOrientation()).toBe(160)
        expect(rwy.getEnd("34")?.getOrientation()).toBe(340)
        expect(rwy.getEnd("XX")).toBeUndefined()
        airport.addRunway(rwy);
        expect(airport.runways.length).toBe(1)
    })
});

