export class NavlogTools {
    static calculateNauticalMiles(lat1:number, lon1:number, lat2:number, lon2:number) {
    
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

        return distance;
    }

    static toRadians(degrees:number) {
        return degrees * Math.PI / 180;
    }
}


