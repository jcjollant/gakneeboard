import {describe, expect, test} from '@jest/globals';
import { Adip } from '../backend/Adip';
import { Airport } from '../backend/models/Airport';
import { AirportView } from '../backend/models/AirportView';
import { PatternDirection } from '../backend/models/Runway'

import { kbfiData, krntData } from './adipData'
import { krntAtcs } from './constants';

function checkAtc(airport:AirportView,expectedAtcs:any) {
    expect(airport.atc).toHaveLength(expectedAtcs.length)

    for(let index = 0; index < expectedAtcs.length; index++) {
        const atc = airport.atc[index]
        const expected = expectedAtcs[index]
        expect(atc.mhz).toBe(expected.mhz)
        expect(atc.use).toHaveLength(expected.useCount)
        expect(atc.name).toBe(expected.name)
    }
}



describe( 'Airport View', () => {
    test( 'Undefined constructor', () => {
        const undefinedView = new AirportView(undefined)
        expect(undefinedView).toBeDefined()
        expect(undefinedView.asof).toBe(0)
    })

    test('undefined view', () => {
        const airportCode = 'code'
        const undefinedView = AirportView.getUndefined(airportCode)
        expect(undefinedView).toBeDefined()
        expect(undefinedView.code).toBe(airportCode)
        expect(undefinedView.asof).toBe(0)
        expect(undefinedView.freq).toHaveLength(0)
        expect(undefinedView.rwys).toHaveLength(0)
        expect(undefinedView.navaids).toHaveLength(0)
        expect(undefinedView.atc).toHaveLength(0)
    })

    test('Defined view', () => {
        const airportCode = 'code'
        const airportName = 'name'
        const airportElevation = 1234
        const airport = new Airport( airportCode, airportName, airportElevation)
        const view = new AirportView(airport)
        expect(view).toBeDefined() 
        expect(view.asof).toBe(0)
        expect(view.code).toBe(airportCode) 
        expect(view.name).toBe(airportName)
        expect(view.freq).toHaveLength(0)
        expect(view.rwys).toHaveLength(0)
        expect(view.custom).toBeFalsy()
        expect(view.navaids).toHaveLength(0)
        expect(view.atc).toHaveLength(0)
    })

    test('Boeing View', () => {
        const view = new AirportView(Adip.airportFromData(kbfiData))
        // console.log(v6)
        expect(view).toBeInstanceOf(AirportView)
        if( view) {
            expect(view.rwys.length).toBe(2)
            const expectedRwys = [{name:'14L-32R',mhz:118.3},{name:'14R-32L',mhz:120.6}]
            for(let index = 0; index < expectedRwys.length; index++) {
                const rwy = view.rwys[index]
                expect(rwy.name).toBe(expectedRwys[index].name)
                expect(rwy.freq).toBe(expectedRwys[index].mhz)
            }
        }
        expect(view.asof).toBe(20240711)
    })

    test('Renton view', () => {
        const view = new AirportView(Adip.airportFromData(krntData));
        expect(view).toBeDefined()
        expect(view).toBeInstanceOf(AirportView)
        expect(view?.asof).toBe(20240613)
        expect(view?.code).toBe('KRNT')
        expect(view?.name).toBe('Renton Muni')
        const allFreq = [['CTAF','124.7'],['GND','121.6'],['ATIS','126.95'],['TWR','124.7'],['UNICOM','122.95']]
        expect(view.freq).toHaveLength(allFreq.length)
        // Test all frequencies
        for(const pair of allFreq) {
            // console.log(pair[0])
            const freq = Airport.getFrequencyMhz(view.freq, pair[0])
            expect(freq).toBeDefined()
            expect(freq).toBe(Number(pair[1]))
        }

        expect(view?.elev).toBe(32)
        expect(view?.rwys.length).toBe(1)
        const rwy0 = view?.rwys[0]
        expect(rwy0?.name).toBe("16-34")
        expect(rwy0?.length).toBe(5382)
        expect(rwy0?.width).toBe(200)
        expect(rwy0?.surface?.type).toBe("ASPH-CONC")
        expect(rwy0?.surface?.cond).toBe("(G) Good")
        // check ends
        const end0 = rwy0?.getEnd('16')
        expect(end0?.mag).toBe(157)
        expect(end0?.tp).toBe(PatternDirection.Left)
        const end1 = rwy0?.getEnd('34')
        expect(end1?.mag).toBe(337)
        expect(end1?.tp).toBe(PatternDirection.Right)
        // check navaids
        const expectedNavaids = [{id:"SEA",freq:116.8,type:"VORTAC",dist:5.2,to:47.7,},{id:"PAE",freq:110.6,type:"VOR/DME",dist:25.7,to:174.4,},{id:"OLM",freq:113.4,type:"VORTAC",dist:42,to:41.5,},{id:"CVV",freq:117.2,type:"VOR/DME",dist:49.6,to:155.4,}]
        for(let index = 0; index < expectedNavaids.length; index++) {
            const navaid = view.navaids[index]
            expect(navaid.id).toBe(expectedNavaids[index].id)
            expect(navaid.freq).toBe(expectedNavaids[index].freq)
            expect(navaid.type).toBe(expectedNavaids[index].type)
            expect(navaid.dist).toBe(expectedNavaids[index].dist)
            expect(navaid.to).toBe(expectedNavaids[index].to)
        }
        // check ATCs
        checkAtc(view, krntAtcs)
    })

    test('Format as of', () => {
        expect( AirportView.formatAsOf('bogus')).toBe(0)
        // "effectiveDate":"2024-07-11T00:00:00"
        expect( AirportView.formatAsOf('2024-07-11T00:00:00')).toBe(20240711)
        expect( AirportView.formatAsOf('2024-07-11T')).toBe(20240711)
        expect( AirportView.formatAsOf('2024-07-11')).toBe(20240711)
        expect( AirportView.formatAsOf('2024_07_11')).toBe(0)
        // "effectiveDate":"2024-08-08T00:00:00"
        expect( AirportView.formatAsOf('2024-08-08T00:00:00')).toBe(20240808)
    })
})