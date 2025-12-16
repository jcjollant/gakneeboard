import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { getAirport, saveCustomAirport } from '../src/services/AirportService';
import { Airport } from '../src/models/Airport';
import { LocalStore } from '../src/lib/LocalStore';
import axios from 'axios';
import { sessionAirports, backend, currentUser, reportError } from '../src/assets/data';

// Mock dependencies
jest.mock('axios');
jest.mock('../src/lib/LocalStore');

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

describe('AirportService', () => {
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
            (mockCurrentUser.getUrl as jest.Mock).mockResolvedValue({ data: kpae });

            const result = await getAirport('KPAE');

            expect(result).toEqual(kpae);
            expect(mockCurrentUser.getUrl).toHaveBeenCalledWith(expect.stringContaining('airport/KPAE'));
            expect(mockSessionAirports.set).toHaveBeenCalledWith('KPAE', kpae);
            expect(LocalStore.airportAdd).toHaveBeenCalledWith('KPAE', kpae);
        });

        test('should handle API errors gracefully', async () => {
            (mockCurrentUser.getUrl as jest.Mock).mockRejectedValue(new Error('Network error'));

            const result = await getAirport('KPAE');

            expect(result).toBeNull();
            expect(mockSessionAirports.setInvalid).toHaveBeenCalledWith('KPAE');
        });
    });

    describe('saveCustomAirport', () => {
        test('should post airport data to backend', async () => {
            (axios.post as jest.Mock).mockResolvedValue({ data: 'success' });

            await saveCustomAirport(kpae);

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('airport'),
                expect.objectContaining({
                    user: 'mock-user-hash',
                    airport: kpae
                }),
                expect.anything()
            );
        });

        test('should report error on failure', async () => {
            const error = new Error('Save failed');
            (axios.post as jest.Mock).mockRejectedValue(error);

            await saveCustomAirport(kpae);

            expect(mockReportError).toHaveBeenCalledWith(expect.stringContaining('custom airport save error'));
        });
    });
});
