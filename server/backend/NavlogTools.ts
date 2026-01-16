import { AirportService } from "./services/AirportService";
import { GApi } from "./GApi";
import { NavlogEntry } from "./models/NavlogEntry";
import { XMLParser, XMLValidator } from 'fast-xml-parser'

export class NavlogTools {

    static calculateTrueCourse(lat1: number, lon1: number, lat2: number, lon2: number) {
        // Convert latitude and longitude to radians
        const φ1 = NavlogTools.toRadians(lat1);
        const φ2 = NavlogTools.toRadians(lat2);
        const λ1 = NavlogTools.toRadians(lon1);
        const λ2 = NavlogTools.toRadians(lon2);
        const Δλ = (λ2 - λ1);

        // Calculate true course
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        const φ = Math.atan2(y, x);

        // Convert back to degrees
        const trueCourse = NavlogTools.toDegrees(φ);

        // Normalize to 0-360 range
        const normalizedTrueCourse = Math.round((trueCourse + 360) % 360);

        return normalizedTrueCourse;
    }


    static calculateNauticalMiles(lat1: number, lon1: number, lat2: number, lon2: number) {

        // Earth's radius in nautical miles
        const earthRadius = 3440.065;

        // Convert latitude and longitude to radians
        const φ1 = NavlogTools.toRadians(lat1);
        const φ2 = NavlogTools.toRadians(lat2);
        const Δφ = NavlogTools.toRadians(lat2 - lat1);
        const Δλ = NavlogTools.toRadians(lon2 - lon1);

        // Haversine formula
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Calculate the distance
        const distance = earthRadius * c;

        // round up second decimal to second decimal
        const roundedDistance = Math.round(distance * 100) / 100;
        return roundedDistance;
    }

    static async importFlightPlan(data: Buffer): Promise<NavlogEntry[]> {
        let output: NavlogEntry[] = [];
        const promise = new Promise<NavlogEntry[]>(async (resolve, reject) => {
            try {
                const stringData: string = data.toString();
                if (!XMLValidator.validate(stringData)) {
                    throw new Error('Invalid XML')
                }

                const parser = new XMLParser()
                const json = parser.parse(stringData)
                const waypoints = json['flight-plan']['waypoint-table'].waypoint
                // console.log(JSON.stringify(waypoints))
                if (waypoints.length == 0) {
                    throw new Error('No waypoints found')
                }
                // We will determine lat/lon ahead and replace with next waypoints
                // during iteration
                let lat: number = 0
                let lon: number = 0
                let nextLat: number = 0
                let nextLon: number = 0
                let distance: number | undefined = undefined
                let trueCourse: number | undefined = undefined

                for (let i = 0; i < waypoints.length; i++) {
                    const wp = waypoints[i]
                    const last = (i == waypoints.length - 1)
                    const first = (i == 0)
                    const name = wp.identifier
                    let ld: number | undefined = undefined;
                    if (first) {
                        lat = wp.lat
                        lon = wp.lon
                    }
                    // Distance can be caculated except for last
                    if (last) {
                        distance = undefined
                        trueCourse = undefined
                    } else {
                        const nextWp = waypoints[i + 1]
                        nextLat = nextWp.lat
                        nextLon = nextWp.lon
                        distance = this.calculateNauticalMiles(lat, lon, nextLat, nextLon)
                        trueCourse = this.calculateTrueCourse(lat, lon, nextLat, nextLon)
                    }
                    // Fetch First and last waypoints altitude if they are airports
                    let altitude: number | undefined = undefined
                    if ((first || last) && wp.type == 'AIRPORT') {
                        const airport = await AirportService.getAirport(name)
                        if (airport) altitude = airport.elev
                    }
                    output.push(new NavlogEntry(name, altitude, trueCourse, distance))
                    lat = nextLat
                    lon = nextLon
                }
            } catch (e) {
                console.log('[NavlogTools.importFlightPlan] ' + e);
                reject("Incorrect File Format")
            }
            // console.log('[NavlogTools.importFlightPlan] ' + JSON.stringify(output));
            resolve(output);
        })
        return promise;
    }

    static toDegrees(radians: number) {
        return radians * 180 / Math.PI;
    }

    static toRadians(degrees: number) {
        return degrees * Math.PI / 180;
    }

}


