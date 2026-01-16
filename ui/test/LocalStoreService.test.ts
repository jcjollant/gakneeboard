import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { LocalStoreService } from '../src/services/LocalStoreService';

describe('LocalStoreService', () => {

    // Mock localStorage
    const localStorageMock = (() => {
        let store: { [key: string]: string } = {};
        return {
            getItem: jest.fn((key: string) => store[key] || null),
            setItem: jest.fn((key: string, value: string) => {
                store[key] = value.toString();
            }),
            removeItem: jest.fn((key: string) => {
                delete store[key];
            }),
            clear: jest.fn(() => {
                store = {};
            })
        };
    })();

    Object.defineProperty(global, 'localStorage', {
        value: localStorageMock
    });

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    describe('airportRecentsGet', () => {
        test('should return empty list if no recent airports', () => {
            const result = LocalStoreService.airportRecentsGet();
            expect(result).toEqual([]);
        });

        test('should return full list by default', () => {
            const recentStr = 'KSEA-KPAE-KBFI';
            localStorageMock.getItem.mockReturnValue(recentStr);

            const result = LocalStoreService.airportRecentsGet();
            expect(result).toEqual(['KSEA', 'KPAE', 'KBFI']);
            expect(localStorageMock.getItem).toHaveBeenCalledWith(LocalStoreService.recentAirports);
        });

        test('should return restricted list when count is provided', () => {
            const recentStr = 'KSEA-KPAE-KBFI-KPDX-KGEG';
            localStorageMock.getItem.mockReturnValue(recentStr);

            // Get last 3
            const result = LocalStoreService.airportRecentsGet(3);
            expect(result).toEqual(['KBFI', 'KPDX', 'KGEG']);
        });

        test('should return full list if count is greater than list length', () => {
            const recentStr = 'KSEA-KPAE';
            localStorageMock.getItem.mockReturnValue(recentStr);

            const result = LocalStoreService.airportRecentsGet(5);
            expect(result).toEqual(['KSEA', 'KPAE']);
        });

        test('should return full list if count is undefined', () => {
            const recentStr = 'KSEA-KPAE-KBFI';
            localStorageMock.getItem.mockReturnValue(recentStr);

            const result = LocalStoreService.airportRecentsGet();
            expect(result).toEqual(['KSEA', 'KPAE', 'KBFI']);
        });
    });

    describe('airportRecentsUpdate', () => {
        test('notifies listeners', async () => {
            const listener = jest.fn();
            const unsubscribe = LocalStoreService.subscribe(listener);

            await LocalStoreService.airportRecentsUpdate('KLAX');

            expect(listener).toHaveBeenCalled();

            unsubscribe();
        });
    });
});

