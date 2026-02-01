
import axios from 'axios';
import { GApiError } from '../GApiError';
import { ApiCallDao, ApiName } from '../dao/ApiCallDao';
import { TicketService } from './TicketService';

import { Metar } from '@checklist/shared';

export interface FullMetar extends Metar {
    lat: number;
    lon: number;
    elev: number;
    name: string;
}

export interface MetarParams {
    ids?: string;
    bbox?: string;
    format?: 'raw' | 'decoded' | 'json' | 'geojson' | 'xml' | 'iwxxm';
    taf?: boolean;
    hours?: number;
    date?: string;
}

export class WeatherService {
    private static readonly BASE_URL = 'https://aviationweather.gov/api/data/metar';

    /**
     * Fetch METAR data from AviationWeather.gov
     * @param params MetarParams
     * @returns Promise<Metar[] | any> The METAR data (format depends on requested format)
     */
    public static async getMetar(params: MetarParams): Promise<FullMetar[] | any> {
        // console.log('[WeatherService.getMetar]', params);
        try {
            const response = await axios.get(this.BASE_URL, {
                params: params
            });

            // Log API Call
            const code = params.ids || params.bbox || 'unknown';
            const dataLength = JSON.stringify(response.data).length;
            ApiCallDao.save(ApiName.Metar, code, dataLength).catch(e => {
                TicketService.create(5, '[WeatherService] Failed to log API call ' + e);
            });

            return response.data;
        } catch (error) {
            const message = 'Failed to fetch METAR data ' + error;
            console.error(message);
            TicketService.create(3, message);
            if (axios.isAxiosError(error) && error.response) {
                throw new GApiError(error.response.status, `Weather Service Error: ${error.response.statusText}`);
            }
            throw new GApiError(500, 'Failed to fetch METAR data');
        }
    }
}
