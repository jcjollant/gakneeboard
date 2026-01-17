import { describe, expect, test } from '@jest/globals';
import { AirportService } from '../src/services/AirportService';
import { Airport } from '../src/models/Airport';
import airportKBFI from './fixtures/airportKBFI.json';

describe('AirportService', () => {
    // Create an Airport instance from the fixture
    const airport = Airport.copy(airportKBFI);

    test('should return correct simple frequency', () => {
        const freq = AirportService.getFreq(airport, 'UNICOM');
        expect(freq).toBe(122.95);
    });

    test('should return correct tower frequencies for KBFI', () => {
        const towerFreqs = AirportService.getFreqTowerAll(airport);
        expect(towerFreqs.length).toBe(2);

        // Check for specific frequencies
        const mhzList = towerFreqs.map(f => f.mhz);
        expect(mhzList).toContain(118.3);
        expect(mhzList).toContain(120.6);
    });

    test('should return correct IFR tower frequency (highest priority)', () => {
        // Based on logic: list.sort((f1, f2) => f2.mhz - f1.mhz)[0].mhz;
        // 120.6 > 118.3
        const freq = AirportService.getFreqTowerIfr(airport);
        expect(freq).toBe(120.6);
    });

    test('should return undefined for missing frequency', () => {
        const freq = AirportService.getFreq(airport, 'MISSING');
        expect(freq).toBeUndefined();
    });

    test('should return correct weather frequency', () => {
        const freq = AirportService.getFreqWeather(airport);
        expect(freq).toBeDefined();
        expect(freq?.value).toBe('127.750');
        expect(freq?.name).toBe('ATIS');
    });

    test('should return correct ground frequency', () => {
        const freq = AirportService.getFreqGround(airport);
        expect(freq).toBeDefined();
        expect(freq.value).toBe('121.900');
    });
});
