import { describe, expect, test } from '@jest/globals';
import { RouteService } from '../src/services/RouteService';
import { Route } from '@gak/shared';

describe('RouteService', () => {
    describe('getAirportCode', () => {
        const route: Route = {
            dep: 'KBFI',
            dst: 'KSEA',
            alt: 'KPAE'
        };

        test('should return departure airport for #dep segment', () => {
            expect(RouteService.getAirportCode(route, '#dep')).toBe('KBFI');
        });

        test('should return destination airport for #dst segment', () => {
            expect(RouteService.getAirportCode(route, '#dst')).toBe('KSEA');
        });

        test('should return alternate airport for #alt segment', () => {
            expect(RouteService.getAirportCode(route, '#alt')).toBe('KPAE');
        });

        test('should return undefined for invalid segment', () => {
            expect(RouteService.getAirportCode(route, '#invalid')).toBeUndefined();
        });

        test('should return undefined if route is undefined', () => {
            expect(RouteService.getAirportCode(undefined, '#dep')).toBeUndefined();
        });

        test('should return undefined if segment property is missing in route', () => {
            const partialRoute: Route = { dep: 'KBFI' };
            expect(RouteService.getAirportCode(partialRoute, '#dst')).toBeUndefined();
        });
    });

    describe('getSegment', () => {
        const route: Route = {
            dep: 'KBFI',
            dst: 'KSEA',
            alt: 'KPAE'
        };

        test('should return "dep" if code matches departure', () => {
            expect(RouteService.getSegment(route, 'KBFI')).toBe('dep');
        });

        test('should return "dst" if code matches destination', () => {
            expect(RouteService.getSegment(route, 'KSEA')).toBe('dst');
        });

        test('should return "alt" if code matches alternate', () => {
            expect(RouteService.getSegment(route, 'KPAE')).toBe('alt');
        });

        test('should return undefined for non-matching code', () => {
            expect(RouteService.getSegment(route, 'KORD')).toBeUndefined();
        });

        test('should return undefined if route is undefined', () => {
            expect(RouteService.getSegment(undefined, 'KBFI')).toBeUndefined();
        });

        test('should return undefined if code is empty', () => {
            expect(RouteService.getSegment(route, '')).toBeUndefined();
        });
    });
});
