import { describe, expect, test } from '@jest/globals';
import { Frequency, FrequencyType } from '../src/models/Frequency';
import { Airport } from '../src/models/Airport';
import { AirportService } from '../src/services/AirportService'

const kpae = { "version": 9, "code": "KPAE", "name": "Seattle Paine Fld Intl", "elev": 606.9, "custom": false, "asof": 20250220, "freq": [{ "name": "CTAF", "mhz": 132.95, "notes": "" }, { "name": "UNICOM", "mhz": 122.95, "notes": "" }, { "name": "ATIS", "mhz": 128.65, "notes": "" }, { "name": "CD/P", "mhz": 127.175, "notes": "" }, { "name": "GND", "mhz": 121.8, "notes": "" }, { "name": "TWR", "mhz": 120.2, "notes": "RWY 16L/34R" }, { "name": "TWR", "mhz": 132.95, "notes": "RWY 16R/34L" }], "rwys": [{ "name": "16L-34R", "length": 3004, "width": 75, "ends": [{ "tp": "L", "name": "16L", "mag": 164 }, { "tp": "R", "name": "34R", "mag": 344 }], "freq": 120.2, "surface": { "type": "ASPH", "cond": "(G) Good" } }, { "name": "16R-34L", "length": 9010, "width": 150, "ends": [{ "tp": "R", "name": "16R", "mag": 163 }, { "tp": "L", "name": "34L", "mag": 343 }], "freq": 132.95, "surface": { "type": "ASPH-CONC", "cond": "(G) Good" } }], "navaids": [{ "id": "PAE", "freq": 110.6, "type": "VOR/DME", "dist": 0.8, "to": 192.9 }, { "id": "CVV", "freq": 117.2, "type": "VOR/DME", "dist": 27, "to": 138.6 }, { "id": "SEA", "freq": 116.8, "type": "VORTAC", "dist": 28.4, "to": 2.2 }, { "id": "HUH", "freq": 113, "type": "VORTAC", "dist": 63.4, "to": 169.1 }], "atc": [{ "mhz": 125.6, "name": "SEATTLE-TACOMA APPROACH CONTROL", "use": ["OLYMPIA STAR"] }, { "mhz": 128.5, "name": "SEATTLE-TACOMA APPROACH CONTROL", "use": ["APCH/P DEP/P"] }], "iap": [{ "name": "ILS Y OR LOC Y RWY 16R", "pdf": "2502/00142IYLY16R.PDF" }, { "name": "ILS Z OR LOC Z RWY 16R", "pdf": "2502/00142IZLZ16R.PDF" }, { "name": "ILS Z RWY 16R (SA CAT II)", "pdf": "2502/00142IZ16RSAC2.PDF" }, { "name": "RNAV (GPS) RWY 34L", "pdf": "2502/00142R34L.PDF" }, { "name": "RNAV (GPS) Y RWY 16R", "pdf": "2502/00142RY16R.PDF" }, { "name": "RNAV (GPS) Z RWY 16R", "pdf": "2502/00142RZ16R.PDF" }, { "name": "VOR-A", "pdf": "2502/00142VA.PDF" }], "dep": [], "diag": "2502/00142AD.PDF" }

describe('Airport', () => {
    test('Frequencies', () => {
        const airport = Airport.copy(kpae)
        expect(airport.freq.length).toBe(7)
        const gndFrequency = AirportService.getFreqGround(airport)
        expect(gndFrequency).toBeDefined()
        expect(gndFrequency?.name).toBe("Ground")
        expect(gndFrequency?.value).toBe("121.800")
        expect(gndFrequency?.type).toBe(FrequencyType.ground)
    })

    test('diagram', () => {
        const expected = "2502/00142AD.PDF"
        const airport = Airport.copy(kpae)
        expect(airport.diagram).toBe(expected)
    })

    test('Invalid', () => {
        const invalid = new Airport();
        expect(invalid.isValid()).toBe(false)
    })
})