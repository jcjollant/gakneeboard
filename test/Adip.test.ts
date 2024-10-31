import {describe, expect, test} from '@jest/globals';
import { Adip } from '../backend/adip/Adip'
import { Airport } from '../backend/models/Airport';
import { PatternDirection, Runway, RunwaySurface } from '../backend/models/Runway'
import { kbffData, kbfiData, kcdwData, kdzjData, krntData, s43Data } from './adipData'
import { krntAtcs } from './constants';

function checkAtc(airport:Airport,expectedAtcs:any) {
    expect(airport.atc).toHaveLength(expectedAtcs.length)

    for(let index = 0; index < expectedAtcs.length; index++) {
        const atc = airport.atc[index]
        const expected = expectedAtcs[index]
        expect(atc.mhz).toBe(expected.mhz)
        expect(atc.use).toHaveLength(expected.useCount)
        expect(atc.name).toBe(expected.name)
    }
}

describe('Adip', () => {

    test('Military frequencies', () => {
        expect(Adip.isMilitary(123.0)).toBeFalsy()
        expect(Adip.isMilitary(269.9)).toBeTruthy()
    })

    test('Variation should be <0 for East and >0 for west',() =>{
        let data = {'magneticVariation':'15E'}
        expect(Adip.getVariation(data)).toBe(-15)
        data = {'magneticVariation':'16W'}
        expect(Adip.getVariation(data)).toBe(16)
        // no data => defaults to 0
        const data2 = {}
        expect(Adip.getVariation(data2)).toBe(0)
    })

    test('Runway surface', () => {
        const data = {}
        const rs1:RunwaySurface = new RunwaySurface('?','?')
        expect( Adip.getRunwaySurface(data)).toEqual(rs1)
        const data2 = { surfaceType:"type",surfaceCondition:"condition"}
        const rs2:RunwaySurface = Adip.getRunwaySurface(data2)
        expect(rs2.type).toEqual("type")
        expect(rs2.cond).toEqual("condition")
        const data3 = { surfaceTypeCondition:"typecondition"}
        const rs3:RunwaySurface = Adip.getRunwaySurface(data3)
        expect(rs3.type).toEqual("typecondition")
        expect(rs3.cond).toEqual("typecondition")
    }) 

    test('Frequency parsing',() => {
        expect(Adip.parseFrequency('117.1 ;ARR-NE')).toBe(117.1)
        expect(Adip.parseFrequency('123.0')).toBe(123.0)    
        expect(Adip.parseFrequency('120.2 ;RWY 16L/34R')).toBe(120.2)    

        const seattleApproachFreq = '119.2 ;017-079 SEA RWY 34'
        expect(Adip.parseFrequency(seattleApproachFreq)).toBe(119.2)
        expect(Adip.parseFrequencyNotes(seattleApproachFreq)).toBe('017-079 SEA RWY 34')
    })

    test('Runway Frequency', () => {
        const rwy:Runway = new Runway('14L/32R', 3709, 100)        
        expect(Adip.getRunwayFrequency(kbfiData, kbfiData.runways[0])).toBe(118.3)
        expect(Adip.getRunwayFrequency(kbfiData, kbfiData.runways[1])).toBe(120.6)
    })

    test('Names are capitalized', () => {
        const adip1:any = {name:'THIS IS A NAME'}
        expect(Adip.getName(adip1)).toBe('This Is A Name')    
        const adip2:any = {name:'THISISANAME'}
        expect(Adip.getName(adip2)).toBe('Thisisaname')    
    })

    test('Renton fields',async () =>{
        const before = Date.now()
        const airport = Adip.airportFromData(krntData)
        // console.log(JSON.stringify(airport))
        expect(airport.code).toBe('KRNT')
        expect(airport.name).toBe('Renton Muni')
        const allFreq = [['CTAF','124.7'],['GND','121.6'],['ATIS','126.95'],['TWR','124.7'],['UNICOM','122.95']]
        expect(airport.freq).toHaveLength(allFreq.length)
        // Test all frequencies
        for(const pair of allFreq) {
            // console.log(pair[0])
            const freq = airport.getFreq(pair[0])
            expect(freq).toBeDefined()
            expect(freq).toBe(Number(pair[1]))

        }
        expect(airport?.location?.lat).toBeCloseTo(47.493138888)
        expect(airport?.location?.lon).toBeCloseTo(-122.21575)
        expect(airport.elev).toBe(32)
        expect(airport.rwys).toHaveLength(1)
        const runway = airport.rwys[0]
        expect(runway).toBeDefined()
        expect(runway.name).toBe('16-34')
        expect(runway.length).toBe(5382)
        expect(runway.width).toBe(200)
        const surface:RunwaySurface|undefined = runway.surface;
        expect(surface?.type).toBe('ASPH-CONC')
        expect(surface?.cond).toBe('(G) Good')
        // Ends
        expect(runway.ends).toHaveLength(2)
        const end16 = runway.getEnd('16')
        expect(end16).toBeDefined()
        expect(end16?.mag).toBe(157)
        expect(end16?.tp).toBe(PatternDirection.Left)
        const end34 = runway.getEnd('34')
        expect(end34).toBeDefined()
        expect(end34?.mag).toBe(337)
        expect(end34?.tp).toBe(PatternDirection.Right)

        // Navaids
        expect(airport.navaids).toHaveLength(4)
        const expectedNavaids = [
            {"id":"SEA","freq":116.8,"type":"VORTAC","dist":5.2,"to":47.7},
            {"id":"PAE","freq":110.6,"type":"VOR/DME","dist":25.7,"to":174.4},
            {"id":"OLM","freq":113.4,"type":"VORTAC","dist":42,"to":41.5},
            {"id":"CVV","freq":117.2,"type":"VOR/DME","dist":49.6,"to":155.4}]
        for(let index = 0; index < airport.navaids.length; index++) {
            expect(airport.navaids[index].id).toBe(expectedNavaids[index].id)
            expect(airport.navaids[index].freq).toBe(expectedNavaids[index].freq)
            expect(airport.navaids[index].type).toBe(expectedNavaids[index].type)
            expect(airport.navaids[index].dist).toBe(expectedNavaids[index].dist)
            expect(airport.navaids[index].to).toBe(expectedNavaids[index].to)
        }

        // console.log(JSON.stringify(airport.atc))

        // ATC
        checkAtc( airport, krntAtcs)

        // effectiveDate should be defined
        expect(airport.effectiveDate).toBe('2024-06-13T00:00:00')
        // ICAO should be defined
        // Fecth time should be higer
        expect(airport.fetchTime).toBe(0)
        expect(airport.version).toBe(Airport.currentVersion)
    })

    test('S43 fields', () =>{
        const before = Date.now()
        const airport = Adip.airportFromData(s43Data)
        expect(airport.code).toBe('S43')
        expect(airport.name).toBe('Harvey Fld')
        expect(airport.elev).toBe(22.8)
        expect(airport.rwys).toHaveLength(2)
        expect(airport.version).toBe(Airport.currentVersion)
        expect(airport.freq).toHaveLength(2)
    })

    test('KBFI fields', () => {
        const airport = Adip.airportFromData(kbfiData)
        expect(airport.code).toBe('KBFI')
        expect(airport.rwys).toHaveLength(2)
        expect(airport.rwys[0].freq).toBeDefined()
        expect(airport.rwys[1].freq).toBeDefined()
        expect(airport.freq).toHaveLength(6)
    })

    test('KDZJ fields', () => {
        // This data is particular for have AWOS-3PT
        const airport = Adip.airportFromData(kdzjData)
        expect(airport.code).toBe('KDZJ')
        expect(airport.freq).toHaveLength(3)
        expect(airport.freq[0].name).toBe('CTAF')
        expect(airport.freq[0].mhz).toBe(122.8)
        expect(airport.freq[1].name).toBe('UNICOM')
        expect(airport.freq[1].mhz).toBe(122.8)
        expect(airport.freq[2].name).toBe('AWOS-3PT')
        expect(airport.freq[2].mhz).toBe(119.325)
    })

    test('KCDW fields', () => {
        // This data is particular for having a huge number of VOR
        const airport = Adip.airportFromData(kcdwData)
        expect(airport.code).toBe('KCDW')
        expect(airport.navaids).toHaveLength(10)

        // console.log(JSON.stringify(airport.atc))
        const expectedAtcs = [
            {mhz:119.2, useCount:1, name:'NEW YORK TRACON'},
            {mhz:127.6, useCount:2, name:'NEW YORK TRACON'},
            {mhz:132.8, useCount:1, name:'NEW YORK TRACON'},
        ]
        checkAtc( airport, expectedAtcs)

    })

    test('KBFF data', () => {
        const airport = Adip.airportFromData(kbffData)
        expect(airport.code).toBe('KBFF')
        expect(airport.name).toBe('Western Nebraska Rgnl/wm B Heilig Fld/scottsbluff')
    })

    test('Invalid Code', () => {
        try {
            const airport = Adip.airportFromData({"error":"noAirportData"})
            expect(true).toBeFalsy()
        } catch(e) {
        }
    })
})
