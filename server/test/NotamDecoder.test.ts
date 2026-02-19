import { describe, expect, it } from '@jest/globals';
import { NotamDecoder } from '../backend/services/NotamDecoder';

describe('NotamDecoder', () => {
    it('should decode common abbreviations', () => {
        const input = "RWY 13/31 CLSD";
        const expected = "RUNWAY 13/31 CLOSED";
        expect(NotamDecoder.decode(input)).toBe(expected);
    });

    it('should NOT decode PAPI', () => {
        const input = "PAPI U/S";
        // PAPI should remain PAPI, U/S should decode to UNSERVICEABLE
        const expected = "PAPI UNSERVICEABLE";
        expect(NotamDecoder.decode(input)).toBe(expected);
    });

    it('should NOT decode VOR', () => {
        const input = "VOR UNUSBL";
        // VOR should remain VOR, UNUSBL should decode to UNUSABLE
        const expected = "VOR UNUSABLE";
        expect(NotamDecoder.decode(input)).toBe(expected);
    });

    it('should handle multiple abbreviations', () => {
        const input = "TWY A CLSD DUPE";
        // TWY -> TAXIWAY, CLSD -> CLOSED. DUPE is not in list so stays DUPE.
        const expected = "TAXIWAY A CLOSED DUPE";
        expect(NotamDecoder.decode(input)).toBe(expected);
    });

    it('should NOT decode GPS or RNAV', () => {
        const input = "GPS AND RNAV APCH";
        const expected = "GPS AND RNAV APPROACH";
        expect(NotamDecoder.decode(input)).toBe(expected);
    });
});
