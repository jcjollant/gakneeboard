import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { SkyvectorService } from '../backend/services/SkyvectorService';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ApiCallDao
jest.mock('../backend/dao/ApiCallDao', () => ({
    ApiCallDao: {
        save: jest.fn()
    },
    ApiName: {
        Skyvector: 'skyvector'
    }
}));
import { ApiCallDao, ApiName } from '../backend/dao/ApiCallDao';

describe('SkyvectorService', () => {
    const service = new SkyvectorService();
    const kpaoHtmlPath = path.join(__dirname, 'htmlData', 'kpao.skyvector.html');
    let kpaoHtml: string;

    try {
        kpaoHtml = fs.readFileSync(kpaoHtmlPath, 'utf-8');
    } catch (e) {
        console.warn("Could not read KPAO fixture, tests might fail if not mocked properly.");
        kpaoHtml = "";
    }

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and parse KPAO airport data correctly', async () => {
        // Setup mock response
        mockedAxios.get.mockResolvedValue({
            data: kpaoHtml,
            status: 200,
            request: {
                res: {
                    responseUrl: 'https://skyvector.com/airport/KPAO/Palo-Alto-Airport'
                }
            },
            config: { url: 'https://skyvector.com/api/airportSearch?query=KPAO' }
        });

        const airport = await service.fetchAirport('KPAO');

        expect(airport).toBeDefined();
        if (!airport) return;

        expect(airport.code).toBe('KPAO');
        expect(airport.name).toBe('Palo Alto Airport'); // Based on title "PAO - Palo Alto Airport | SkyVector" -> cleaned

        // Location (from fixture data)
        // Coordinates: N37°27.67' / W122°06.90'
        // 37 + 27.67/60 = 37.461166...
        // -122 - 6.90/60 = -122.115
        expect(airport.location.lat).toBeCloseTo(37.461, 3);
        expect(airport.location.lon).toBeCloseTo(-122.115, 3);
        expect(airport.elev).toBeCloseTo(6); // Elevation is 6 feet MSL.

        // Runways
        // 13-31
        expect(airport.rwys.length).toBeGreaterThan(0);
        const rwy1331 = airport.rwys.find(r => r.name === '13-31');
        expect(rwy1331).toBeDefined();
        if (rwy1331) {
            expect(rwy1331.length).toBe(2441);
            expect(rwy1331.width).toBe(70);
            expect(rwy1331.surface?.type).toContain('Asphalt');
            // Heading: 13 -> 142 (True per SkyVector), 31 -> 322 (True per SkyVector)
            // Service parses these as-is.
            const end13 = rwy1331.getEnd('13');
            const end31 = rwy1331.getEnd('31');
            expect(end13?.mag).toBe(142);
            expect(end31?.mag).toBe(322);
        }

        // Frequencies
        // KPAO has multiple freqs
        // TOWER 118.6, GND 125.0, ATIS 135.275
        const tower = airport.getFreq('PALO ALTO TOWER');
        expect(tower).toBe(118.6);
        const gnd = airport.getFreq('PALO ALTO GROUND');
        expect(gnd).toBe(125.0);

        // Navaids (if any)
        // Usually "Nearby Navigation Aids"
        // SJC 114.1, OSI 115.5 etc.
        const sjc = airport.navaids.find(n => n.id === 'SJC');
        expect(sjc).toBeDefined();
        if (sjc) {
            expect(sjc.freq).toBe(114.1);
        }


        // Verify save IS called by default
        expect(ApiCallDao.save).toHaveBeenCalledWith(ApiName.Skyvector, 'KPAO', expect.anything());

        jest.clearAllMocks();

        // Call again with saveRawData = false
        await service.fetchAirport('KPAO', false);
        expect(ApiCallDao.save).not.toHaveBeenCalled();
    });

    it('should handle search redirects correctly', async () => {
        mockedAxios.get.mockResolvedValue({
            data: kpaoHtml,
            status: 200,
            request: {
                res: {
                    responseUrl: 'https://skyvector.com/airport/KPAO/Palo-Alto-Airport'
                }
            },
            config: { url: 'https://skyvector.com/api/airportSearch?query=KPAO' }
        });

        const airport = await service.fetchAirport('KPAO');
        expect(airport).toBeDefined();
        expect(airport?.sketch).toBe('https://skyvector.com/airport/KPAO/Palo-Alto-Airport');
    });

    it('should return undefined if redirected to search page', async () => {
        mockedAxios.get.mockResolvedValue({
            data: '<html>Search Results...</html>',
            status: 200,
            request: {
                res: {
                    responseUrl: 'https://skyvector.com/search/site/INVALID'
                }
            },
            config: { url: 'https://skyvector.com/api/airportSearch?query=INVALID' }
        });

        const airport = await service.fetchAirport('INVALID');
        expect(airport).toBeUndefined();
    });

    it('should return undefined if redirected to unknown page', async () => {
        mockedAxios.get.mockResolvedValue({
            data: '<html>...</html>',
            status: 200,
            request: {
                res: {
                    responseUrl: 'https://skyvector.com/some-random-page'
                }
            },
            config: { url: 'https://skyvector.com/api/airportSearch?query=WAT' }
        });

        const airport = await service.fetchAirport('WAT');
        expect(airport).toBeUndefined();
    });
});
