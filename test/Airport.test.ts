
import { describe, expect, test } from '@jest/globals'
import { Airport } from '../backend/models/Airport'
import { Atc } from '../backend/models/Atc'
import { Frequency } from '../backend/models/Frequency'
import { PatternDirection, Runway, RunwayEnd } from '../backend/models/Runway'

describe('Airport', () => {
    test ('Airport should be an object', () => {
        const airport = new Airport( "name", "JCJ", 32);
        expect(typeof airport).toBe('object');
        expect(airport.freq.length).toBe(0)
        expect(airport.rwys.length).toBe(0)
        expect(airport.version).toBe(Airport.currentVersion)
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

    test('Frequencies, ATC', () => {
        const airport = new Airport("name", "JCJ", 32);
        const ctaf:string = "CTAF"
        const ctafFreq = 124.7
        const gnd:string = "GND"
        const gndFreq = 121.6
        airport.addFrequency( ctaf, ctafFreq);
        airport.addFrequency(gnd, gndFreq)
        expect(airport.freq.length).toBe(2)
        // read back
        expect(airport.getFreq( ctaf)).toBe(ctafFreq)
        expect(airport.getFreq( gnd)).toBe(gndFreq)

        const atis:string = "ATIS"
        const atisFreq = 126.95
        const twr:string = "TWR"
        const twrFreq = 124.7
        const f1:Frequency = new Frequency( atis, atisFreq)
        const f2:Frequency = new Frequency( twr, twrFreq)
        airport.addFrequencies([f1,f2])
        expect(airport.freq).toHaveLength(4)
        expect(airport.getFreq(atis)).toBe(atisFreq)
        expect(airport.getFreq(twr)).toBe(twrFreq)


        // ATC
        const atc1Freq:number = 123.1
        const atc1Use:string = 'APCH/P'
        const atc1Use2:string = 'CD/P'
        const atc1Name:string = 'name1'
        const atc1:Atc = new Atc(atc1Freq, atc1Name,atc1Use)
        atc1.addUse(atc1Use2)

        const atc2Freq = 123.2
        const atc2Use = 'CD/P'
        const atc2Name = 'name2'
        const atc2:Atc = new Atc(atc2Freq, atc2Name, atc2Use)
        const atcs = [atc1,atc2]
        airport.addAtcs(atcs)

        expect(airport.atc.length).toBe(2)
        expect(airport.atc[0].mhz).toBe(atc1Freq)
        expect(airport.atc[0].use[0]).toBe(atc1Use)
        expect(airport.atc[0].use[1]).toBe(atc1Use2)
        expect(airport.atc[0].name).toBe(atc1Name)
        expect(airport.atc[1].mhz).toBe(atc2Freq)
        expect(airport.atc[1].use[0]).toBe(atc2Use)
        expect(airport.atc[1].name).toBe(atc2Name)
    })

    test('Runways', () => {
        const airport = new Airport("name", "JCJ", 32);
        const rwy = new Runway("16-34", 5400, 150)
        expect(rwy.getOrientation('16')).toBe(160)
        expect(rwy.getOrientation('34')).toBe(340)
        expect(rwy.getOrientation("XX")).toBeUndefined()

        // Patterns should default to left
        expect(rwy.getTrafficPattern("16")).toBe(PatternDirection.Left)
        expect(rwy.getTrafficPattern("34")).toBe(PatternDirection.Left)
        // Should be able to change pattern
        rwy.setTrafficPattern('34', PatternDirection.Right)
        expect(rwy.getTrafficPattern("34")).toBe(PatternDirection.Right)
        // Invalid pattern should not change
        expect(() => {
            rwy.setTrafficPattern('', PatternDirection.Left)
        }).toThrow('Runway end [] not found')
        expect(rwy.getTrafficPattern("34")).toBe(PatternDirection.Right)

        // ends name
        const endsName:string[] = rwy.getEndsName()
        expect(endsName.length).toBe(2)
        expect(endsName[0]).toBe("16")
        expect(endsName[1]).toBe("34")

        // ends
        const end16:RunwayEnd|undefined = rwy.getEnd('16')
        expect(end16).toBeDefined()
        expect(end16?.mag).toBe(160)
        expect(end16?.name).toBe("16")
        expect(end16?.tp).toBe("L")

        const end34:RunwayEnd|undefined = rwy.getEnd('34')
        expect(end34).toBeDefined()
        expect(end34?.mag).toBe(340)
        expect(end34?.name).toBe("34")
        expect(end34?.tp).toBe("R")

        // Add first runway
        airport.addRunway(rwy);
        expect(airport.rwys.length).toBe(1)

        const rwy2 = new Runway("17-35", 5400, 150)
        const rwy3 = new Runway("18-36", 5400, 150)
        // add multiple runways
        airport.addRunways([rwy2,rwy3]);
        expect(airport.rwys.length).toBe(3)

        // Ends name
        const rwy2EndsName = rwy2.getEndsName()
        expect(rwy2EndsName.length).toBe(2)
        expect(rwy2EndsName[0]).toBe("17")
        expect(rwy2EndsName[1]).toBe("35")
        const end17 = rwy2.getEnd('17')
        expect(end17?.mag).toBe(170)
        expect(end17?.tp).toBe(PatternDirection.Left)
        end17?.setTrafficPattern(PatternDirection.Left)
        expect(end17?.tp).toBe(PatternDirection.Left)
        end17?.setTrafficPattern(PatternDirection.Right)
        expect(end17?.tp).toBe(PatternDirection.Right)
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

