import { Route, RouteCode } from "@gak/shared";
import { Frequency, FrequencyType } from "./../models/Frequency";
import { getAirport } from "./AirportDataService";
import { AirportService } from "./AirportService";
export class RouteService {
    static getAirportCode(route: Route | undefined, code: RouteCode | undefined): string | undefined {
        // console.debug('[RouteService.getAirportCode] route', route, 'code', code)
        if (!route || !code) return undefined
        // Segment must be one of 'dep', 'dst' or 'alt'
        if (code == 'dep') return route.dep
        if (code == 'dst') return route.dst
        if (code == 'alt') return route.alt
        return undefined
    }

    static getRouteCode(route: Route | undefined, airportCode: string): RouteCode | undefined {
        if (!route) return undefined
        if (route.dep == airportCode) return "dep"
        if (route.dst == airportCode) return "dst"
        if (route.alt == airportCode) return "alt"
        return undefined
    }

    static async fetchRouteFrequencies(route: Route | undefined): Promise<Frequency[]> {
        if (!route) return [];

        const codes = [route.dep, route.dst, route.alt].filter(Boolean) as string[];
        const uniqueCodes = [...new Set(codes)];

        let generatedFrequencies: Frequency[] = [];

        for (const code of uniqueCodes) {
            try {
                const airport = await getAirport(code, true);
                if (airport) {
                    const towerFreqMhz = AirportService.getFreqTower(airport);
                    const ctafFreqMhz = AirportService.getFreqCtaf(airport);
                    const weatherFreq = AirportService.getFreqWeather(airport);

                    if (weatherFreq) {
                        generatedFrequencies.push(new Frequency(weatherFreq.value, airport.code + ' ' + weatherFreq.name, FrequencyType.weather));
                    }

                    if (towerFreqMhz) {
                        generatedFrequencies.push(new Frequency(towerFreqMhz.toFixed(3), airport.code + ' TWR', FrequencyType.tower));
                    } else if (ctafFreqMhz) {
                        generatedFrequencies.push(new Frequency(ctafFreqMhz.toFixed(3), airport.code + ' CTAF', FrequencyType.ctaf));
                    }
                }
            } catch (error) {
                console.error('[RouteService] Error loading airport for route frequency', code, error);
            }
        }

        return generatedFrequencies;
    }
}