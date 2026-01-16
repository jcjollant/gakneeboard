import { Airport } from './Airport'

/**
 * Type for airport data source classes that can fetch and validate airport information
 * This describes the static interface that implementing classes should provide
 */
export type AirportDataSource = {

    /**
     * Fetches airport data for the given code
     * @param code Airport code
     * @param saveRawData Whether to save raw data from the source
     * @returns Airport object or undefined if not found
     */
    fetchAirport(code: string, saveRawData?: boolean): Promise<Airport | undefined>

    /**
     * Checks if the airport is stale
     * @param airport Airport object
     * @returns Promise<boolean> indicating whether the airport is stale
     */
    airportIsStale(airport: Airport): Promise<boolean>
}
