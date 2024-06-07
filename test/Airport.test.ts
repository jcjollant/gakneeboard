
import {describe, expect, test} from '@jest/globals';
import { Airport, Runway } from "../backend/models/Airport"; 

describe('Airport', () => {
    test ('Airport should be an object', () => {
        const airport = new Airport( "name", "JCJ", 32);
        expect(typeof airport).toBe('object');
        expect(airport.freq.length).toBe(0)
        expect(airport.rwys.length).toBe(0)
        expect(airport.version).toBe(6)
    })

    test('Airport code validation', () => {
        // too long
        expect(Airport.isValidCode("JCJCJ")).toBeFalsy()
        // just right x 2
        expect(Airport.isValidCode("JCJC")).toBeTruthy()
        expect(Airport.isValidCode("JCJ")).toBeTruthy()
        // too short all the way down
        expect(Airport.isValidCode("JC")).toBeFalsy()
        expect(Airport.isValidCode("J")).toBeFalsy()
        expect(Airport.isValidCode("")).toBeFalsy()
    })

    test('Frequencies', () => {
        const airport = new Airport("name", "JCJ", 32);
        airport.addFrequency("CTAF", 124.7);
        expect(airport.freq.length).toBe(1)
    })

    test('Runways', () => {
        const airport = new Airport("name", "JCJ", 32);
        const rwy = new Runway("16-34", 5400, 150)
        expect(rwy.getOrientation('16')).toBe(160)
        expect(rwy.getOrientation('34')).toBe(340)
        expect(rwy.getOrientation("XX")).toBeUndefined()

        // Patterns should default to left
        expect(rwy.getTrafficPattern("16")).toBe(Runway.leftPattern)
        expect(rwy.getTrafficPattern("34")).toBe(Runway.leftPattern)
        // Should be able to change pattern
        rwy.setTrafficPattern('34', Runway.rightPattern)
        expect(rwy.getTrafficPattern("34")).toBe(Runway.rightPattern)
        // Invalid pattern should not affect
        rwy.setTrafficPattern('34', 'Random')
        expect(rwy.getTrafficPattern("34")).toBe(Runway.rightPattern)

        // Add first runway
        airport.addRunway(rwy);
        expect(airport.rwys.length).toBe(1)

        const rwy2 = new Runway("17-35", 5400, 150)
        const rwy3 = new Runway("18-36", 5400, 150)
        // add multiple runways
        airport.addRunways([rwy2,rwy3]);
        expect(airport.rwys.length).toBe(3)
    })

    test('Runway name validation', () => {
        const rwy = new Runway("16-34", 5400, 150)
        expect(Runway.isValidName("16-34")).toBeTruthy()
        expect(Runway.isValidName("04L-22R")).toBeTruthy()
        // missin separator
        expect(Runway.isValidName("1634")).toBeFalsy()
        // mising end
        expect(Runway.isValidName("16-")).toBeFalsy()
        expect(Runway.isValidName("00-18")).toBeFalsy()
        // Because 37 
        expect(Runway.isValidName("19-37")).toBeFalsy()
        // Because NW-SE
        expect(Runway.isValidName("NW-SE")).toBeFalsy()
    })

});

