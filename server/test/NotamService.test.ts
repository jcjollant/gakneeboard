import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NotamService, NotamClassification, NmsResponseFormat } from '../backend/services/NotamService';

// Mocking fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

jest.mock('../backend/dao/ApiCallDao', () => ({
    ApiCallDao: {
        save: jest.fn(),
    },
    ApiName: {
        Nms: 'nms'
    }
}));

describe('NotamService', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        process.env.NMS_API_URL = 'https://api.example.com';
        process.env.NMS_API_KEY = 'test-client-id';
        process.env.NMS_API_SECRET = 'test-client-secret';
        mockFetch.mockClear();
        (NotamService as any).token = undefined;
        (NotamService as any).tokenExpiry = 0;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Configuration', () => {
        it('should throw error if env vars are missing', async () => {
            delete process.env.NMS_API_URL;

            await expect(NotamService.getNotams({ nmsResponseFormat: NmsResponseFormat.GEOJSON }))
                .rejects.toMatchObject({
                    status: 500,
                    message: expect.stringContaining('NMS_API_URL not configured')
                });
        });
    });

    describe('Authentication', () => {
        it('should fetch a token if not present', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ access_token: 'new-token', expires_in: 3600 })
            } as Response);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'Success', data: {} })
            } as Response);

            await NotamService.getNotams({ nmsResponseFormat: NmsResponseFormat.GEOJSON });

            expect(mockFetch).toHaveBeenCalledTimes(2);
            // First call to auth
            expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://api.example.com/v1/auth/token', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': expect.stringContaining('Basic ')
                })
            }));
            // Second call to API
            expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://api.example.com/notams?', expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer new-token',
                    'nmsResponseFormat': 'GEOJSON'
                })
            }));
        });

        it('should reuse a valid token', async () => {
            // Seed a token
            (NotamService as any).token = 'existing-token';
            (NotamService as any).tokenExpiry = Date.now() + 100000;

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'Success', data: {} })
            } as Response);

            await NotamService.getNotams({ nmsResponseFormat: NmsResponseFormat.GEOJSON });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/notams'), expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer existing-token'
                })
            }));
        });

        it('should throw error if auth fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => 'Unauthorized'
            } as Response);

            await expect(NotamService.getNotams({ nmsResponseFormat: NmsResponseFormat.GEOJSON }))
                .rejects.toThrow('Failed to get token: 401 Unauthorized');
        });
    });

    describe('getNotams', () => {
        beforeEach(() => {
            // Mock auth success
            (NotamService as any).token = 'valid-token';
            (NotamService as any).tokenExpiry = Date.now() + 10000;
        });

        it('should construct correct query parameters', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'Success', data: {} })
            } as Response);

            await NotamService.getNotams({
                nmsResponseFormat: NmsResponseFormat.AIXM,
                classification: NotamClassification.DOMESTIC,
                location: 'KJFK',
                radius: 10
            });

            const expectedUrl = 'https://api.example.com/notams?classification=DOMESTIC&location=KJFK&radius=10';
            const call = mockFetch.mock.calls[0];
            expect(call[0]).toEqual(expectedUrl);
            const options = call[1] as RequestInit;
            expect(options.headers).toHaveProperty('nmsResponseFormat', 'AIXM');
        });
    });

    describe('getInitialLoad', () => {
        beforeEach(() => {
            (NotamService as any).token = 'valid-token';
            (NotamService as any).tokenExpiry = Date.now() + 10000;
        });

        it('should call correct endpoint', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'Success', data: { url: 'http://download' } })
            } as Response);

            await NotamService.getInitialLoad(NotamClassification.MILITARY, true);

            expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/notams/il/MILITARY?allowRedirect=true', expect.any(Object));
        });
    });

    describe('getLocationSeries', () => {
        beforeEach(() => {
            (NotamService as any).token = 'valid-token';
            (NotamService as any).tokenExpiry = Date.now() + 10000;
        });

        it('should call correct endpoint', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'Success', data: {} })
            } as Response);

            await NotamService.getLocationSeries('2025-01-01');

            expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/locationseries?lastUpdatedDate=2025-01-01', expect.any(Object));
        });
    });

    describe('getChecklist', () => {
        beforeEach(() => {
            (NotamService as any).token = 'valid-token';
            (NotamService as any).tokenExpiry = Date.now() + 10000;
        });

        it('should call correct endpoint', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'Success', data: {} })
            } as Response);

            await NotamService.getChecklist({ location: 'KSEA' });

            expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/notams/checklist?location=KSEA', expect.any(Object));
        });
    });
    describe('getSimplifiedNotams', () => {
        beforeEach(() => {
            (NotamService as any).token = 'valid-token';
            (NotamService as any).tokenExpiry = Date.now() + 10000;
        });

        it('should filter out cancelled NOTAMs, including real-world examples with whitespace', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    status: 'Success',
                    data: {
                        geojson: [
                            {
                                type: 'Feature',
                                properties: {
                                    coreNOTAMData: {
                                        notam: {
                                            number: '1',
                                            text: 'ACTIVE NOTAM'
                                        }
                                    }
                                }
                            },
                            {
                                type: 'Feature',
                                properties: {
                                    coreNOTAMData: {
                                        notam: {
                                            number: 'A0083/26',
                                            text: "A0083/26 NOTAMC A0075/26 \nQ) KZSE/QMXXX////000/999/4754N12217W005 \nA) KPAE\nB) 2602171644\nE)  PAE TWY C BTN TWY A AND TERMINAL RAMP FICON WET DEICED SOLID OBS\nCANCELED"
                                        }
                                    }
                                }
                            },
                            {
                                type: 'Feature',
                                properties: {
                                    coreNOTAMData: {
                                        notam: {
                                            number: 'A0084/26',
                                            text: "A0084/26 NOTAMC A0076/26 \n... CANCELED \n  " // Trailing newline and spaces
                                        }
                                    }
                                }
                            }
                        ]
                    }
                })
            } as Response);

            const result = await NotamService.getSimplifiedNotams({ location: 'KJFK' });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });
    });
});
