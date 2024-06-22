import {describe, expect, test} from '@jest/globals';
import { AirportTools } from '../backend/AirportTools';
import { Airport, Runway } from '../backend/models/Airport';

const rentonV5 = {"locId":"RNT","code":"KRNT","icaoId":"KRNT","name":"Renton Muni","ctaf":"124.700","twr":"Y","gnd":"121.6","elev":32,"tpa":1032,"weather":{"freq":"126.95","type":"ATIS"},"effectiveDate":"2024-05-16T00:00:00","version":5,"rwy":[{"16":{"orientation":157,"pattern":"left"},"34":{"orientation":337,"pattern":"right"},"name":"16-34","length":5382,"width":200,"surface":{"type":"ASPH-CONC","condition":"G"}}],"fetchTime":1716070694266}
const boeingV5 = {"locId":"BFI","code":"KBFI","icaoId":"KBFI","name":"Boeing Fld/king County Intl","twr":"Y","gnd":"121.9","elev":21.6,"tpa":1022,"weather":{"freq":"127.75","type":"ATIS"},"effectiveDate":"2024-05-16T00:00:00","version":5,"rwy":[{"name":"14L-32R","length":3709,"width":100,"surface":{"type":"ASPH","condition":"F"},"freq":"118.3","14L":{"orientation":135,"pattern":"left"},"32R":{"orientation":315,"pattern":"right"}},{"name":"14R-32L","length":10007,"width":200,"surface":{"type":"ASPH","condition":"G"},"freq":"120.6","14R":{"orientation":135,"pattern":"right"},"32L":{"orientation":315,"pattern":"left"}}],"fetchTime":1716069283360}

describe( 'Airport Tools', () => {
    test( 'Renton v5 to v6', () => {
        const v6 = AirportTools.format(rentonV5)
        expect(v6).toBeInstanceOf(Airport)
        if( v6) {
            expect(v6.code).toBe('KRNT')
            expect(v6.name).toBe('Renton Muni')
            expect(v6.effectiveDate).toBe('2024-05-16T00:00:00')
            expect(v6.freq.length).toBe(3)
            expect(v6.freq[0].name).toBe('CTAF')
            expect(v6.freq[0].mhz).toBe(124.7)
            expect(v6.freq[1].name).toBe('GND')
            expect(v6.freq[1].mhz).toBe(121.6)
            expect(v6.freq[2].name).toBe('ATIS')
            expect(v6.freq[2].mhz).toBe(126.95)
            expect(v6.elev).toBe(32)
            expect(v6.rwys.length).toBe(1)
            const rwy0 = v6.rwys[0]
            expect(rwy0.name).toBe("16-34")
            expect(rwy0.length).toBe(5382)
            expect(rwy0.width).toBe(200)
            expect(rwy0.surface?.type).toBe("ASPH-CONC")
            expect(rwy0.surface?.cond).toBe("G")
            // check ends
            const end0 = rwy0.getEnd('16')
            expect(end0?.mag).toBe(157)
            expect(end0?.tp).toBe(Runway.leftPattern)
            const end1 = rwy0.getEnd('34')
            expect(end1?.mag).toBe(337)
            expect(end1?.tp).toBe(Runway.rightPattern)
        }
    })

    test('Runway frequency', () => {
        const v6 = AirportTools.format(boeingV5)
        // console.log(v6)
        expect(v6).toBeInstanceOf(Airport)
        if( v6) {
            expect(v6.rwys.length).toBe(2)
            const rwy0 = v6.rwys[0]
            const rwy0Name = "14L-32R"
            expect(rwy0.name).toBe(rwy0Name)
            expect(rwy0.freq).toBe(118.3)
            const rwy0Freq = v6.getFreq("RWY " + rwy0Name)
            expect( rwy0Freq).toBe(118.3)
        }
  })
})