export class NavMath {
    /**
     * Calculates ground speed given True Airspeed, Heading, and Wind components.
     * 
     * @param tas True Airspeed in knots
     * @param heading Heading in degrees (True or Magnetic)
     * @param windDir Direction the wind is blowing FROM in degrees (same reference as heading)
     * @param windSpeed Wind Speed in knots
     * @returns Ground Speed in knots
     */
    public static calculateGroundSpeed(tas: number, heading: number, windDir: number, windSpeed: number): number {
        if (windSpeed === 0) return tas;
        if (tas === 0) return windSpeed;

        const toRad = 0.01745329252;

        // Wind vector direction is WD + 180 (blowing TOWARDS)
        const windTowards = (windDir + 180) % 360;

        // Components (Aviation: 0 is North/Y+, 90 is East/X+)
        const windX = windSpeed * Math.sin(windTowards * toRad);
        const windY = windSpeed * Math.cos(windTowards * toRad);

        const tasX = tas * Math.sin(heading * toRad);
        const tasY = tas * Math.cos(heading * toRad);

        const groundX = tasX + windX;
        const groundY = tasY + windY;

        const gs = Math.sqrt(groundX * groundX + groundY * groundY);

        return Math.round(gs * 10) / 10; // Round to 1 decimal place
    }
}
