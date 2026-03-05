import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { RouteService } from '../src/services/RouteService';
import { Route } from '@gak/shared';
import { getAirport } from '../src/services/AirportDataService';
import { FrequencyType } from '../src/models/Frequency';
import { Airport } from '../src/models/Airport';

jest.mock('../src/services/AirportDataService');
const mockGetAirport = jest.mocked(getAirport);

describe('RouteService', () => {
    describe('getAirportCode', () => {
        const route: Route = {
            dep: 'KBFI',
            dst: 'KSEA',
            alt: 'KPAE'
        };

        test('should return departure airport for dep segment', () => {
            expect(RouteService.getAirportCode(route, 'dep')).toBe('KBFI');
        });

        test('should return destination airport for dst segment', () => {
            expect(RouteService.getAirportCode(route, 'dst')).toBe('KSEA');
        });

        test('should return alternate airport for alt segment', () => {
            expect(RouteService.getAirportCode(route, 'alt')).toBe('KPAE');
        });

        test('should return undefined for invalid segment', () => {
            expect(RouteService.getAirportCode(route, 'invalid' as any)).toBeUndefined();
        });

        test('should return undefined if route is undefined', () => {
            expect(RouteService.getAirportCode(undefined, 'dep')).toBeUndefined();
        });

        test('should return undefined if segment property is missing in route', () => {
            const partialRoute: Route = { dep: 'KBFI' };
            expect(RouteService.getAirportCode(partialRoute, 'dst')).toBeUndefined();
        });
    });

    describe('getRouteCode', () => {
        const route: Route = {
            dep: 'KBFI',
            dst: 'KSEA',
            alt: 'KPAE'
        };

        test('should return "dep" if code matches departure', () => {
            expect(RouteService.getRouteCode(route, 'KBFI')).toBe('dep');
        });

        test('should return "dst" if code matches destination', () => {
            expect(RouteService.getRouteCode(route, 'KSEA')).toBe('dst');
        });

        test('should return "alt" if code matches alternate', () => {
            expect(RouteService.getRouteCode(route, 'KPAE')).toBe('alt');
        });

        test('should return undefined for non-matching code', () => {
            expect(RouteService.getRouteCode(route, 'KORD')).toBeUndefined();
        });

        test('should return undefined if route is undefined', () => {
            expect(RouteService.getRouteCode(undefined, 'KBFI')).toBeUndefined();
        });

        test('should return undefined if code is empty', () => {
            expect(RouteService.getRouteCode(route, '')).toBeUndefined();
        });
    });

    describe('fetchRouteFrequencies', () => {
        const route: Route = {
            dep: 'KBFI',
            dst: 'KSEA',
            alt: 'KPAE'
        };

        const createMockAirport = (code: string, weather: number, tower?: number, ctaf?: number, ground?: number) => {
            const airport = new Airport(code, code + ' Airport');
            if (weather) airport.addFrequency('ATIS', weather);
            if (tower) airport.addFrequency('TWR', tower);
            if (ctaf) airport.addFrequency('CTAF', ctaf);
            if (ground) airport.addFrequency('GND', ground);
            return airport;
        };

        const mockAirportBFI = createMockAirport('KBFI', 127.75, 118.3, undefined, 121.7);
        const mockAirportSEA = createMockAirport('KSEA', 118.0, 119.9, undefined, 121.9);
        const mockAirportPAE = createMockAirport('KPAE', 128.65, undefined, 120.2, 121.8);

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should return empty array if route is undefined', async () => {
            const result = await RouteService.fetchRouteFrequencies(undefined);
            expect(result).toEqual([]);
        });

        test('should fetch frequencies for all airports in route', async () => {
            mockGetAirport.mockImplementation((code: string) => {
                if (code === 'KBFI') return Promise.resolve(mockAirportBFI);
                if (code === 'KSEA') return Promise.resolve(mockAirportSEA);
                if (code === 'KPAE') return Promise.resolve(mockAirportPAE);
                return Promise.resolve(null);
            });

            const result = await RouteService.fetchRouteFrequencies(route);

            expect(result.length).toBe(9); // 3 frequencies per airport (Weather, TWR/CTAF, GND)

            // Checking BFI
            expect(result.some(f => f.name === 'KBFI ATIS' && f.value === '127.750' && f.type === FrequencyType.weather)).toBe(true);
            expect(result.some(f => f.name === 'KBFI TWR' && f.value === '118.300' && f.type === FrequencyType.tower)).toBe(true);
            expect(result.some(f => f.name === 'KBFI GND' && f.value === '121.700' && f.type === FrequencyType.ground)).toBe(true);

            // Checking PAE (CTAF)
            expect(result.some(f => f.name === 'KPAE ATIS' && f.value === '128.650' && f.type === FrequencyType.weather)).toBe(true);
            expect(result.some(f => f.name === 'KPAE CTAF' && f.value === '120.200' && f.type === FrequencyType.ctaf)).toBe(true);
            expect(result.some(f => f.name === 'KPAE GND' && f.value === '121.800' && f.type === FrequencyType.ground)).toBe(true);
        });

        test('should handle duplicate airport codes', async () => {
            const duplicateRoute: Route = { dep: 'KBFI', dst: 'KBFI' };
            mockGetAirport.mockResolvedValue(mockAirportBFI);

            const result = await RouteService.fetchRouteFrequencies(duplicateRoute);

            expect(result.length).toBe(3); // Only one set of frequencies for KBFI
            expect(mockGetAirport).toHaveBeenCalledTimes(1);
        });

        test('should handle missing airport data', async () => {
            mockGetAirport.mockResolvedValue(null);
            const result = await RouteService.fetchRouteFrequencies(route);
            expect(result).toEqual([]);
        });

        test('should handle partial errors in airport fetching', async () => {
            mockGetAirport.mockImplementation((code: string) => {
                if (code === 'KBFI') return Promise.resolve(mockAirportBFI);
                return Promise.reject(new Error('Fetch failed'));
            });

            const result = await RouteService.fetchRouteFrequencies(route);

            expect(result.length).toBe(3); // Only BFI frequencies
            expect(result[0].name).toContain('KBFI');
        });
    });
});
