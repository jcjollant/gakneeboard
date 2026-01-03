import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { AttributionService } from '../src/services/AttributionService';
import { LocalStoreService } from '../src/services/LocalStoreService';

describe('AttributionService', () => {

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

    describe('capture', () => {
        test('should capture valid utm parameters', () => {
            const query = {
                utm_source: 'google',
                utm_medium: 'cpc',
                utm_campaign: 'summer_sale'
            };

            AttributionService.capture(query);

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                LocalStoreService.attribution,
                expect.stringContaining('"source":"google"')
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                LocalStoreService.attribution,
                expect.stringContaining('"medium":"cpc"')
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                LocalStoreService.attribution,
                expect.stringContaining('"campaign":"summer_sale"')
            );
        });

        test('should not store anything if no utm parameters match', () => {
            const query = {
                foo: 'bar',
                baz: 'qux'
            };

            AttributionService.capture(query);

            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

        test('should capture all supported parameters', () => {
            const query = {
                utm_source: 'source',
                utm_medium: 'medium',
                utm_campaign: 'campaign',
                utm_term: 'term',
                utm_content: 'content'
            };

            AttributionService.capture(query);

            const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1] as string);
            expect(stored).toMatchObject({
                source: 'source',
                medium: 'medium',
                campaign: 'campaign',
                term: 'term',
                content: 'content'
            });
            expect(stored.timestamp).toBeDefined();
        });
    });

    describe('getAttribution', () => {
        test('should return null if nothing stored', () => {
            expect(AttributionService.getAttribution()).toBeNull();
        });

        test('should return stored object', () => {
            const data = { source: 'test', timestamp: 12345 };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(data));

            const result = AttributionService.getAttribution();
            expect(result).toEqual(data);
        });
    });

    describe('init', () => {
        test('should capture params from router current route', () => {
            const mockRouter: any = {
                currentRoute: {
                    value: {
                        query: {
                            utm_source: 'router_test'
                        }
                    }
                }
            };

            AttributionService.init(mockRouter);

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                LocalStoreService.attribution,
                expect.stringContaining('"source":"router_test"')
            );
        });

        test('should do nothing if router has no current route (edge case)', () => {
            const mockRouter: any = {
                currentRoute: {
                    value: null
                }
            };

            AttributionService.init(mockRouter);
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });
    });
});
