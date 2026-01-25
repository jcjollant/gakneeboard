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
    describe('notams', () => {
        const airportCode = 'KJFK';
        const notams = [{
            text: 'Test Notam',
            id: '1',
            type: 'Test',
            effectiveStart: '2023-01-01',
            effectiveEnd: '2023-01-02'
        }];

        test('notamsAdd should store notams with timestamp', () => {
            LocalStoreService.notamsAdd(airportCode, notams);

            const key = LocalStoreService.notamsPrefix + airportCode;
            expect(localStorageMock.setItem).toHaveBeenCalledWith(key, expect.any(String));

            // Check payload structure
            const storedValue = (localStorageMock.setItem as jest.Mock).mock.calls[0][1] as string;
            const payload = JSON.parse(storedValue);
            expect(payload.notams).toEqual(notams);
            expect(payload.timestamp).toBeDefined();
        });

        test('notamsGet should retrieve stored notams', () => {
            const key = LocalStoreService.notamsPrefix + airportCode;
            const payload = {
                timestamp: new Date().toISOString(),
                notams: notams
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(payload));

            const result = LocalStoreService.notamsGet(airportCode);
            expect(result).toEqual(notams);
            expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
        });

        test('notamsGet should return empty array if no data found', () => {
            localStorageMock.getItem.mockReturnValue(null);
            const result = LocalStoreService.notamsGet(airportCode);
            expect(result).toEqual([]);
        });

        test('notamsCleanUp should remove expired notams', () => {
            // Mock localStorage with one valid and one expired entry
            const validKey = LocalStoreService.notamsPrefix + 'KLAX';
            const expiredKey = LocalStoreService.notamsPrefix + 'KJFK';

            const validPayload = {
                timestamp: new Date().toISOString(),
                notams: []
            };
            const expiredPayload = {
                timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
                notams: []
            };

            const store: { [key: string]: string } = {
                [validKey]: JSON.stringify(validPayload),
                [expiredKey]: JSON.stringify(expiredPayload),
                'other-key': 'value'
            };

            // Mock length and key() to iterate
            Object.defineProperty(localStorageMock, 'length', { value: 3, configurable: true });
            // @ts-ignore
            localStorageMock.key = jest.fn((i: number) => Object.keys(store)[i]);
            localStorageMock.getItem.mockImplementation((key: string) => store[key] || null);

            LocalStoreService.notamsCleanUp();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith(expiredKey);
            expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(validKey);
            expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other-key');
        });
    });
});

