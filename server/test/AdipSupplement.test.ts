
import { describe, expect, test, jest, afterEach } from '@jest/globals';
import axios from 'axios';
import { AdipService } from '../backend/services/AdipService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdipService Supplement', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetchAirportChartSupplement success', async () => {
        const mockData = {
            airportName: "RENTON MUNI",
            city: "RENTON",
            locId: "RNT",
            cycle: "2405",
            chartName: "NW_130_20JUN2024.pdf,NW_130_20JUN2024_notices_NW.pdf"
        };

        mockedAxios.post.mockResolvedValue({ data: mockData });

        const result = await AdipService.fetchAirportChartSupplement('payload', {});

        expect(result).toBeDefined();
        expect(result.supplementChartName).toBe("2405/NW_130_20JUN2024.pdf");
        expect(result.noticeChartName).toBe("2405/NW_130_20JUN2024_notices_NW.pdf");
    });

    test('fetchAirportChartSupplement single chart', async () => {
        const mockData = {
            airportName: "RENTON MUNI",
            city: "RENTON",
            locId: "RNT",
            cycle: "2405",
            chartName: "NW_130_20JUN2024.pdf"
        };

        mockedAxios.post.mockResolvedValue({ data: mockData });

        const result = await AdipService.fetchAirportChartSupplement('payload', {});

        expect(result.supplementChartName).toBe("2405/NW_130_20JUN2024.pdf");
        expect(result.noticeChartName).toBeUndefined();
    });

    test('fetchAirportChartSupplement failure', async () => {
        mockedAxios.post.mockRejectedValue(new Error('Network Error'));

        await expect(AdipService.fetchAirportChartSupplement('payload', {})).rejects.toThrow('Network Error');
    });

    test('parseAirportChartSupplementData', () => {
        const data = {
            airportName: 'Test Airport',
            city: 'Test City',
            locId: 'TST',
            cycle: '2101',
            chartName: 'supplement.pdf,supplement_notices_notice.pdf'
        };
        const result = AdipService.parseAirportChartSupplementData(data);
        expect(result.supplementChartName).toBe('2101/supplement.pdf');
        expect(result.noticeChartName).toBe('2101/supplement_notices_notice.pdf');
    });

    test('parseAirportChartSupplementData - no notices', () => {
        const data = {
            airportName: 'Test Airport',
            city: 'Test City',
            locId: 'TST',
            cycle: '2101',
            chartName: 'supplement.pdf'
        };
        const result = AdipService.parseAirportChartSupplementData(data);
        expect(result.supplementChartName).toBe('2101/supplement.pdf');
        expect(result.noticeChartName).toBeUndefined();
    });
});
