
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import axios from 'axios';
import { WeatherService } from '../backend/services/WeatherService';
import { GApiError } from '../backend/GApiError';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../backend/dao/ApiCallDao', () => ({
    ApiCallDao: {
        save: jest.fn().mockImplementation(() => Promise.resolve())
    },
    ApiName: {
        Metar: 'metar'
    }
}));

describe('WeatherService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getMetar', () => {
        it('should fetch metar data with correct parameters', async () => {
            mockedAxios.get.mockResolvedValue({
                data: [{ icaoId: 'KJFK', raw: 'METAR ...' }]
            });

            const result = await WeatherService.getMetar({ ids: 'KJFK', format: 'json' });

            expect(mockedAxios.get).toHaveBeenCalledWith('https://aviationweather.gov/api/data/metar', {
                params: {
                    ids: 'KJFK',
                    format: 'json'
                }
            });
            expect(result).toHaveLength(1);
            expect(result[0].icaoId).toBe('KJFK');
        });

        it('should handle errors gracefully', async () => {
            mockedAxios.get.mockRejectedValue({
                response: {
                    status: 500,
                    statusText: 'Internal Server Error'
                },
                isAxiosError: true
            });

            // Using try-catch to verify the custom error structure
            try {
                await WeatherService.getMetar({ ids: 'KJFK' });
                throw new Error('Should have thrown an error');
            } catch (error: any) {
                if (error.message === 'Should have thrown an error') throw error;
                expect(error).toBeInstanceOf(GApiError);
                expect(error.status).toBe(500);
            }
        });
    });
});
