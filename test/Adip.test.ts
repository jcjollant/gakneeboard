import {describe, expect, test} from '@jest/globals';
import { Adip } from '../backend/Adip'
import { Airport, Frequency, PatternDirection, Runway, RunwaySurface } from '../backend/models/Airport';
import { kbfiData, krntData, s43Data } from './adipData'

describe('Adip', () => {

    test('Military frequencies', () => {
        expect(Adip.isMilitary(123.0)).toBe(false)
        expect(Adip.isMilitary(269.9)).toBe(true)
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

    test('Frequencies',() => {
        expect(Adip.parseFrequency('117.1 ;ARR-NE')).toBe(117.1)
        expect(Adip.parseFrequency('123.0')).toBe(123.0)    
        expect(Adip.parseFrequency('120.2 ;RWY 16L/34R')).toBe(120.2)    
        const airport:Airport = new Airport('TEST','TEST',0);
        airport.addFrequency('GND',121.6)
        expect(airport.freq).toHaveLength(1)
        expect(airport.getFreq('GND')).toBe(121.6)
        const f1:Frequency = new Frequency( 'ATIS', 126.95)
        const f2:Frequency = new Frequency( 'TWR', 124.7)
        airport.addFrequencies([f1,f2])
        expect(airport.freq).toHaveLength(3)
        expect(airport.getFreq('GND')).toBe(121.6)
        expect(airport.getFreq('ATIS')).toBe(126.95)
        expect(airport.getFreq('TWR')).toBe(124.7)
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
        console.log(JSON.stringify(airport))
        expect(airport.code).toBe('KRNT')
        expect(airport.name).toBe('Renton Muni')
        const allFreq = [['CTAF','124.7'],['GND','121.6'],['ATIS','126.95'],['TWR','124.7'],['UNICOM','122.95']]
        expect(airport.freq).toHaveLength(allFreq.length)
        // Test all frequencies
        for(const pair of allFreq) {
            console.log(pair[0])
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
    })

    test('KBFI fields', () => {
        const airport = Adip.airportFromData(kbfiData)
        expect(airport.code).toBe('KBFI')
        expect(airport.rwys).toHaveLength(2)
        expect(airport.rwys[0].freq).toBeDefined()
        expect(airport.rwys[1].freq).toBeDefined()
        expect(airport.freq).toHaveLength(6)
    })
})
