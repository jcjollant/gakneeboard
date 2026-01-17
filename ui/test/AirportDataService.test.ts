import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { getAirport, createAirport } from '../src/services/AirportDataService';
import { LocalStoreService } from '../src/services/LocalStoreService';
import { sessionAirports, backend, currentUser, reportError } from '../src/assets/data';
import axios from 'axios';

jest.mock('axios');

// Mock data.js dependencies
jest.mock('../src/assets/data', () => ({
    sessionAirports: {
        data: {},
        get: jest.fn(),
        set: jest.fn(),
        setInvalid: jest.fn(),
        addListener: jest.fn()
    },
    backend: {
        ready: true,
        promise: Promise.resolve(),
        airportEffectiveDate: 20230101,
        airportModelVersion: 1
    },
    currentUser: {
        getUrl: jest.fn(),
        sha256: 'mock-user-hash'
    },
    reportError: jest.fn()
}));

const mockSessionAirports = sessionAirports as any;
const mockBackend = backend as any;
const mockCurrentUser = currentUser as any;
const mockReportError = reportError as jest.Mock;

// Mock LocalStoreService
jest.mock('../src/services/LocalStoreService');

describe('AirportDataService', () => {
    const kpae = { "version": 1, "code": "KPAE", "name": "Seattle Paine Fld Intl", "elev": 606.9, "custom": false, "asof": 20230101 };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSessionAirports.data = {};
        mockSessionAirports.get.mockImplementation((code: string) => mockSessionAirports.data[code]);
        mockSessionAirports.set.mockImplementation((code: string, data: any) => { mockSessionAirports.data[code] = data; });
        mockBackend.ready = true;
    });

    describe('getAirport', () => {
        test('should return null for empty code', async () => {
            const result = await getAirport('');
            expect(result).toBeNull();
        });

        test('should return null for invalid code', async () => {
            const result = await getAirport('INVALID_CODE_TOO_LONG');
            expect(result).toBeNull();
        });

        test('should return cached airport if available in session', async () => {
            mockSessionAirports.data['KPAE'] = kpae;
            const result = await getAirport('KPAE');
            expect(result).toEqual(kpae);
            expect(mockCurrentUser.getUrl).not.toHaveBeenCalled();
        });

        test('should fetch airport from backend if not in session', async () => {
            (mockCurrentUser.getUrl as jest.Mock<() => Promise<any>>).mockResolvedValue({ data: kpae });

            const result = await getAirport('KPAE');

            expect(result).toEqual(kpae);
            expect(mockCurrentUser.getUrl).toHaveBeenCalledWith(expect.stringContaining('airport/KPAE'));
            expect(mockSessionAirports.set).toHaveBeenCalledWith('KPAE', kpae);
            expect(LocalStoreService.airportAdd).toHaveBeenCalledWith('KPAE', kpae);
        });

        test('should handle API errors gracefully', async () => {
            (mockCurrentUser.getUrl as jest.Mock<() => Promise<any>>).mockRejectedValue(new Error('Network error'));

            const result = await getAirport('KPAE');

            expect(result).toBeNull();
            expect(mockSessionAirports.setInvalid).toHaveBeenCalledWith('KPAE');
        });
    });

    describe('createAirport', () => {
        const mockRequest = {
            code: 'KNEW',
            name: 'New Airport',
            elevation: 100,
            trafficPatternAltitude: undefined,
            frequencies: [],
            runways: []
        };
        const mockResponse = { data: { ...mockRequest } };

        test('should create airport and update session on success', async () => {
            (axios.post as unknown as jest.Mock<any>).mockResolvedValue(mockResponse);

            await createAirport(mockRequest);

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('airport'),
                expect.objectContaining({
                    user: 'mock-user-hash',
                    request: mockRequest
                }),
                expect.anything()
            );
            expect(mockSessionAirports.set).toHaveBeenCalledWith('KNEW', mockResponse.data);
        });

        test('should throw error and report it on failure', async () => {
            const error = { message: 'Creation failed' };
            (axios.post as unknown as jest.Mock<any>).mockRejectedValue(error);

            await expect(createAirport(mockRequest)).rejects.toEqual(error);

            expect(mockReportError).toHaveBeenCalledWith(expect.stringContaining('error {"message":"Creation failed"}'));
        });
    });

});
