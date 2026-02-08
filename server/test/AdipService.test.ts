import { describe, expect, it, test } from '@jest/globals';
import { AdipService } from '../backend/services/AdipService'
import { Airport } from '../backend/models/Airport';
import { PatternDirection, Runway, RunwaySurface } from '../backend/models/Runway'
import kbffData from './jsonData/airport/kbff.json'
import kcdwData from './jsonData/airport/kcdw.json'
import kdzjData from './jsonData/airport/kdzj.json'
import kbfiData from './jsonData/airport/kbfi.json'
import krntData from './jsonData/airport/krnt.json'
import kpaeData from './jsonData/airport/kpae.json'
import krntChartData from './jsonData/chart/krnt.json'
import kpaeChartData from './jsonData/chart/kpae.json'
import s43Data from './jsonData/airport/s43.json'
import cypqData from './jsonData/airport/cypq.json'
import { krntAtcs, krntIap, krntApd, krntDep } from './constants';

// combines airport details with chart data
export function airportFromData(airportDetails: any, airportChartData: any): Airport {
    const airport: Airport = AdipService.parseAirport(airportDetails)
    const acd = AdipService.parseAirportChartData(airportChartData);
    airport.iap = acd.iap
    airport.dep = acd.dep
    airport.diagram = acd.diagram
    return airport
}

function checkAtc(airport: Airport, expectedAtcs: any) {
    expect(airport.atc).toHaveLength(expectedAtcs.length)

    for (let index = 0; index < expectedAtcs.length; index++) {
        const atc = airport.atc[index]
        const expected = expectedAtcs[index]
        expect(atc.mhz).toBe(expected.mhz)
        expect(atc.use).toHaveLength(expected.useCount)
        expect(atc.name).toBe(expected.name)
    }
}

describe('AdipService', () => {

    it('gets effectiveDate from variables', () => {
        process.env.EFFECTIVE_DATE = "test"
        expect(AdipService.currentEffectiveDate()).toBe("test")
        // unset environment variable
        delete process.env.EFFECTIVE_DATE
        expect(AdipService.currentEffectiveDate()).toBe(AdipService.defaultEffectiveDate)
    })

    test('airportIsStale', async () => {
        // Setup dates
        const pastDate = "2025-11-27T00:00:00"
        const futureDate = "2099-01-01T00:00:00"
        const specificSetupDate = "2025-12-25T00:00:00"

        // Mock current effective date
        const originalEffectiveDate = process.env.EFFECTIVE_DATE
        process.env.EFFECTIVE_DATE = specificSetupDate

        // Stale airport (old date)
        const staleAirport = new Airport('STALE', 'Stale', 0)
        staleAirport.effectiveDate = pastDate
        expect(await new AdipService().airportIsStale(staleAirport)).toBeTruthy()

        // Fresh airport (future date)
        const freshAirport = new Airport('FRESH', 'Fresh', 0)
        freshAirport.effectiveDate = futureDate
        expect(await new AdipService().airportIsStale(freshAirport)).toBeFalsy()

        // Same date should be fresh (not stale)
        const sameDateAirport = new Airport('SAME', 'Same', 0)
        sameDateAirport.effectiveDate = specificSetupDate
        expect(await new AdipService().airportIsStale(sameDateAirport)).toBeFalsy()

        // Empty effectiveDate should be stale
        const emptyDateAirport = new Airport('EMPTY', 'Empty', 0)
        emptyDateAirport.effectiveDate = ''
        expect(await new AdipService().airportIsStale(emptyDateAirport)).toBeTruthy()

        // Cleanup
        if (originalEffectiveDate) {
            process.env.EFFECTIVE_DATE = originalEffectiveDate
        } else {
            delete process.env.EFFECTIVE_DATE
        }
    })

    test('Military frequencies', () => {
        expect(AdipService.isMilitary(123.0)).toBeFalsy()
        expect(AdipService.isMilitary(269.9)).toBeTruthy()
    })

    test('Variation should be <0 for East and >0 for west', () => {
        let data = { 'magneticVariation': '15E' }
        expect(AdipService.getVariation(data)).toBe(-15)
        data = { 'magneticVariation': '16W' }
        expect(AdipService.getVariation(data)).toBe(16)
        // no data => defaults to 0
        const data2 = {}
        expect(AdipService.getVariation(data2)).toBe(0)
    })

    test('Runway surface', () => {
        const data = {}
        const rs1: RunwaySurface = new RunwaySurface('?', '?')
        expect(AdipService.getRunwaySurface(data)).toEqual(rs1)
        const data2 = { surfaceType: "type", surfaceCondition: "condition" }
        const rs2: RunwaySurface = AdipService.getRunwaySurface(data2)
        expect(rs2.type).toEqual("type")
        expect(rs2.cond).toEqual("condition")
        const data3 = { surfaceTypeCondition: "typecondition" }
        const rs3: RunwaySurface = AdipService.getRunwaySurface(data3)
        expect(rs3.type).toEqual("typecondition")
        expect(rs3.cond).toEqual("typecondition")
    })

    test('Frequency parsing', () => {
        expect(AdipService.parseFrequency('117.1 ;ARR-NE')).toBe(117.1)
        expect(AdipService.parseFrequency('123.0')).toBe(123.0)
        expect(AdipService.parseFrequency('120.2 ;RWY 16L/34R')).toBe(120.2)

        const seattleApproachFreq = '119.2 ;017-079 SEA RWY 34'
        expect(AdipService.parseFrequency(seattleApproachFreq)).toBe(119.2)
        expect(AdipService.parseFrequencyNotes(seattleApproachFreq)).toBe('017-079 SEA RWY 34')
    })

    test('Runway Frequency', () => {
        const rwy: Runway = new Runway('14L/32R', 3709, 100)
        expect(AdipService.getRunwayFrequency(kbfiData, kbfiData.runways[0])).toBe(118.3)
        expect(AdipService.getRunwayFrequency(kbfiData, kbfiData.runways[1])).toBe(120.6)
    })

    test('Names are capitalized', () => {
        const adip1: any = { name: 'THIS IS A NAME' }
        expect(AdipService.getName(adip1)).toBe('This Is A Name')
        const adip2: any = { name: 'THISISANAME' }
        expect(AdipService.getName(adip2)).toBe('Thisisaname')
    })

    test('Renton fields', async () => {
        const before = Date.now()
        const airport = airportFromData(krntData, krntChartData)
        // console.log(JSON.stringify(airport))
        expect(airport.code).toBe('KRNT')
        expect(airport.name).toBe('Renton Muni')
        const allFreq = [['CTAF', '124.7'], ['GND', '121.6'], ['ATIS', '126.95'], ['TWR', '124.7'], ['UNICOM', '122.95']]
        expect(airport.freq).toHaveLength(allFreq.length)
        // Test all frequencies
        for (const pair of allFreq) {
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
        const surface: RunwaySurface | undefined = runway.surface;
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
            { "id": "SEA", "freq": 116.8, "type": "VORTAC", "dist": 5.2, "to": 47.7 },
            { "id": "PAE", "freq": 110.6, "type": "VOR/DME", "dist": 25.7, "to": 174.4 },
            { "id": "OLM", "freq": 113.4, "type": "VORTAC", "dist": 42, "to": 41.5 },
            { "id": "CVV", "freq": 117.2, "type": "VOR/DME", "dist": 49.6, "to": 155.4 }]
        for (let index = 0; index < airport.navaids.length; index++) {
            expect(airport.navaids[index].id).toBe(expectedNavaids[index].id)
            expect(airport.navaids[index].freq).toBe(expectedNavaids[index].freq)
            expect(airport.navaids[index].type).toBe(expectedNavaids[index].type)
            expect(airport.navaids[index].dist).toBe(expectedNavaids[index].dist)
            expect(airport.navaids[index].to).toBe(expectedNavaids[index].to)
        }

        // console.log(JSON.stringify(airport.atc))

        // ATC
        checkAtc(airport, krntAtcs)

        // effectiveDate should be defined
        expect(airport.effectiveDate).toBe('2024-06-13T00:00:00')
        // ICAO should be defined
        // Fecth time should be higer
        expect(airport.fetchTime).toBe(0)
        expect(airport.version).toBe(Airport.currentVersion)

        expect(airport.iap).toBeDefined()
        expect(airport.iap).toEqual(krntIap)
        expect(airport.dep).toBeDefined()
        expect(airport.dep).toEqual(krntDep)
        expect(airport.diagram).toBeDefined()
    })

    test('S43 fields', () => {
        const before = Date.now()
        const airport = AdipService.parseAirport(s43Data)
        expect(airport.code).toBe('S43')
        expect(airport.name).toBe('Harvey Fld')
        expect(airport.elev).toBe(22.8)
        expect(airport.rwys).toHaveLength(2)
        expect(airport.version).toBe(Airport.currentVersion)
        expect(airport.freq).toHaveLength(2)
    })

    test('KBFI fields', () => {
        const airport = AdipService.parseAirport(kbfiData)
        expect(airport.code).toBe('KBFI')
        expect(airport.rwys).toHaveLength(2)
        expect(airport.rwys[0].freq).toBeDefined()
        expect(airport.rwys[1].freq).toBeDefined()
        const expectedFreq = [{ "mhz": 122.95, "name": "UNICOM", "notes": "" }, { "mhz": 127.75, "name": "ATIS", "notes": "" }, { "mhz": 132.4, "name": "CD/P", "notes": "" }, { "mhz": 121.9, "name": "GND", "notes": "" }, { "mhz": 118.3, "name": "TWR", "notes": "RWY 14L/32R" }, { "mhz": 120.6, "name": "TWR", "notes": "RWY 14R/32L & ALL IFR" }, { "mhz": 110.9, "name": "LOC I-BFI 14R", "notes": "" }, { "mhz": 110.9, "name": "LOC I-CHJ 32L", "notes": "" }]
        for (let index = 0; index < expectedFreq.length; index++) {
            expect(airport.freq[index].mhz).toBe(expectedFreq[index].mhz)
            expect(airport.freq[index].name).toBe(expectedFreq[index].name)
            expect(airport.freq[index].notes).toBe(expectedFreq[index].notes)
        }
    })

    test('KDZJ fields', () => {
        // This data is particular for have AWOS-3PT
        const airport = AdipService.parseAirport(kdzjData)
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
        const airport = AdipService.parseAirport(kcdwData)
        expect(airport.code).toBe('KCDW')
        expect(airport.navaids).toHaveLength(10)

        // console.log(JSON.stringify(airport.atc))
        const expectedAtcs = [
            { mhz: 119.2, useCount: 1, name: 'NEW YORK TRACON' },
            { mhz: 127.6, useCount: 2, name: 'NEW YORK TRACON' },
            { mhz: 132.8, useCount: 1, name: 'NEW YORK TRACON' },
        ]
        checkAtc(airport, expectedAtcs)

    })

    test('KBFF data', () => {
        const airport = AdipService.parseAirport(kbffData)
        expect(airport.code).toBe('KBFF')
        expect(airport.name).toBe('Western Nebraska Rgnl/wm B Heilig Fld/scottsbluff')
    })

    test('Invalid Code', () => {
        try {
            const airport = AdipService.parseAirport({ "error": "noAirportData" })
            expect(true).toBeFalsy()
        } catch (e) {
        }
    })

    test('Chart Data', () => {
        const kpae = AdipService.parseAirportChartData(kpaeChartData)
        expect(kpae.iap).toBeDefined()
        expect(kpae.iap).toHaveLength(7)
        expect(kpae.diagram).toBeDefined()
        expect(kpae.dep).toBeDefined()
        expect(kpae.dep).toHaveLength(1)
        const krnt = AdipService.parseAirportChartData(krntChartData)
        expect(krnt.iap).toBeDefined()
        expect(krnt.iap).toHaveLength(3)
        expect(krnt.diagram).toBeDefined()
        expect(krnt.dep).toBeDefined()
        expect(krnt.dep).toHaveLength(2)
    })

    test('KPAE Frequencies', () => {
        const kpae = AdipService.parseAirport(kpaeData);

        // We should see frequency notes
        const allFreq = [
            ['CTAF', 132.95, ''],
            ['UNICOM', 122.95, ''],
            ['ATIS', 128.65, ''],
            ['CD/P', 127.175, ''],
            ['GND', 121.8, ''],
            ['TWR', 120.2, 'RWY 16L/34R'],
            ['TWR', 132.95, 'RWY 16R/34L'],
            ['LOC I-PAE 16R', 109.3, ''],
        ]
        expect(kpae.freq).toHaveLength(allFreq.length)
        // Test all frequencies
        for (let index = 0; index < allFreq.length; index++) {
            const expected = allFreq[index]
            const actual = kpae.freq[index]
            expect(actual.name).toBe(expected[0])
            expect(actual.mhz).toBe(expected[1])
            expect(actual.notes).toBe(expected[2])
        }
    })
    test('CYPQ fields', () => {
        const airport = AdipService.parseAirport(cypqData)
        expect(airport.code).toBe('CYPQ')
        expect(airport.name).toBe('Peterborough')
        expect(airport.elev).toBe(628)
        expect(airport.rwys).toHaveLength(2)

        // Robustness check: Ensure missing runwayIdentifier doesn't crash
        const rwyMissingId = { ...cypqData.runways[0], runwayIdentifier: undefined };
        const dataBadRwy = { ...cypqData, runways: [rwyMissingId] };
        expect(() => AdipService.parseAirport(dataBadRwy)).not.toThrow();
    })

    test('Airport Chart Supplement Data', () => {
        // Test with chartName
        const data = {
            cycle: '2401',
            chartName: 'test_supplement.pdf,test_notices_file.pdf'
        }
        const result = AdipService.parseAirportChartSupplementData(data)
        expect(result.supplementChartName).toBe('2401/test_supplement.pdf')
        expect(result.noticeChartName).toBe('2401/test_notices_file.pdf')

        // Test without chartName
        const dataNoChart = {
            cycle: '2401'
        }
        const resultNoChart = AdipService.parseAirportChartSupplementData(dataNoChart)
        expect(resultNoChart.supplementChartName).toBeUndefined()
        expect(resultNoChart.noticeChartName).toBeUndefined()
    })
})
