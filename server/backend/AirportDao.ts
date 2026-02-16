import { QueryResult, sql } from "@vercel/postgres";
import { Airport, versionInvalid } from "./models/Airport";
import { CodeAndAirport } from "./models/CodeAndAirport";

export class AirportDao {
    public static async count(): Promise<number> {
        const result = await sql`SELECT count(*) FROM Airports`;
        return Number(result.rows[0].count)
    }

    public static async countCurrent(): Promise<number> {
        const result = await sql`SELECT count(*) FROM Airports WHERE version = ${Airport.currentVersion}`;
        return Number(result.rows[0].count)
    }

    public static async countMissingSketches(): Promise<number> {
        const result = await sql`SELECT COUNT(*) FROM airports WHERE sketch ISNULL AND version > -1`
        return Number(result.rows[0].count)
    }

    public static async countValid(): Promise<number> {
        const result = await sql`SELECT count(*) FROM Airports WHERE version > -1`;
        return Number(result.rows[0].count)
    }

    public static async create(airport: Airport) {
        // console.log( '[AirportDao.create] ' + icaoId)
        const result = await sql`INSERT INTO Airports (icao_id, loc_id, Data, Version, Source) VALUES (${airport.icaoId}, ${airport.locId}, ${JSON.stringify(airport)},${airport.version}, ${airport.source}) RETURNING id`;
        airport.id = result.rows[0].id;
    }

    public static async createUnknown(code: string): Promise<void> {
        // console.log( '[AirportDao.createUnknown] ' + code)
        // For unknown airports, we don't know if it is icao or loc. We put it in icao_id for now as generic code.
        await sql`INSERT INTO Airports (icao_id,Version) VALUES (${code},${versionInvalid})`;
    }

    public static parse(row: any, creatorId: number | undefined = undefined): Airport {
        const airport: Airport = row.data ? JSON.parse(row.data) : new Airport(undefined, undefined, "", 0); // Handle new undefined constructor
        // Do we need to salvage the code?
        if (!airport.icaoId) airport.icaoId = row.icao_id || row.code; // Handle transition
        if (!airport.locId) airport.locId = row.loc_id;

        // It's a custom airport if creatorId matches
        airport.custom = (creatorId ? (creatorId == row.creatorid) : false)
        airport.id = row.id;
        airport.version = row.version;
        airport.sketch = row.sketch;
        airport.source = row.source;

        return airport
    }

    /**
     * Build a list of airports that have a current model version and effective date
     * @returns Matching list
     */
    public static async readCurrent(currentEffectiveDate: string): Promise<Airport[]> {
        const result = await sql`SELECT id,icao_id,loc_id,data,version, source FROM Airports WHERE version = ${Airport.currentVersion}`;
        return result.rows.map(row => {
            const airport: Airport = JSON.parse(row.data)
            airport.id = row.id
            airport.icaoId = row.icao_id
            airport.locId = row.loc_id
            airport.version = row.version
            airport.source = row.source
            return airport
        }).filter(a => a.effectiveDate === currentEffectiveDate)
    }

    public static async readMissingSketch(limit: number): Promise<Airport[]> {
        const result = await sql`SELECT * FROM airports WHERE sketch ISNULL AND version != -1 LIMIT ${limit}`
        return result.rows.map(row => AirportDao.parse(row))
    }

    /**
     * Read a list of airports from DB
     * @param list 
     * @param creatorId 
     * @returns two lists, one of CodeAndAirport found, and a list of unknown codes
     */
    public static async codesLookup(list: any, creatorId: number | undefined = undefined): Promise<{ known: CodeAndAirport[], knownUnknown: CodeAndAirport[], notFound: string[] }> {
        // console.log( '[AirportDao.codesLookup] ' + JSON.stringify(list) + ' / ' + creatorId)

        let result: QueryResult;
        if (creatorId) {
            result = await sql`SELECT id,icao_id, loc_id,data,creatorId,version,sketch,source FROM airports WHERE (icao_id = ANY (${list}) OR loc_id = ANY (${list})) AND (creatorId =${creatorId} OR creatorId IS NULL) ORDER BY creatorId`;
        } else { // do not include creatorId
            result = await sql`SELECT id, icao_id, loc_id,data,creatorId,version,sketch,source FROM airports WHERE (icao_id = ANY (${list}) OR loc_id = ANY (${list})) AND creatorId is NULL`;
        }
        // console.log( '[AirportDoa.readList] found', result.rowCount, 'entries for', JSON.stringify(list))

        const known: CodeAndAirport[] = []
        const knownUnknown: CodeAndAirport[] = []

        // Smart Mapping: Map results back to the code that was requested
        // Problem: If I requested "123" and got back "KLAX" (locId=123), I need to associate KLAX with "123".
        // Solution: For each requested code, check if it matches icao_id OR loc_id of the row.

        const requestedCodes = (list as string[])
        const foundMapping = new Set<string>()

        // Map DB result rows to an intermediate list
        // Note: A single row might satisfy multiple requested codes (e.g. requested 'KLAX' and 'LAX' -> both match same row)
        result.rows.forEach(row => {
            // Create the airport object once
            let airport: Airport | undefined = undefined;
            if (row.data) {
                airport = AirportDao.parse(row, creatorId)
            }

            // Find which requested codes this row satisfies
            requestedCodes.forEach(req => {
                if (req === row.icao_id || req === row.loc_id) {
                    foundMapping.add(req)
                    if (airport) {
                        // IMPORTANT: We wrap the *same* airport object, but associated with the *requested* code.
                        // This ensures the frontend gets what it asked for.
                        known.push(new CodeAndAirport(req, airport));
                    } else {
                        const unknownAirport = new Airport(row.icao_id || req, row.loc_id, "", 0) // Basic info
                        unknownAirport.version = versionInvalid
                        knownUnknown.push(new CodeAndAirport(req, unknownAirport))
                    }
                }
            })
        })

        const missing = requestedCodes.filter(code => !foundMapping.has(code))
        const notFound: string[] = missing;

        return { known, knownUnknown, notFound }
    }

    static async updateSketch(code: string, url: string) {
        if (!code) throw new Error('Invalid code')
        return sql`UPDATE Airports SET sketch=${url} WHERE icao_id=${code} OR loc_id=${code}`;
    }


    static async updateAirport(id: number, airport: Airport): Promise<void> {
        // remove airport id from the airport object before updating
        delete airport.id;
        const data: string = JSON.stringify(airport)
        // reassign the id to the airport object
        airport.id = id;
        // console.debug('[AirportDao.updateAirport] id =', id, ', data =', data)
        await sql`UPDATE Airports SET Data=${data}, Version = ${airport.version} WHERE id=${id}`;
    }



    public static async deleteTest() {
        await sql`DELETE FROM airports WHERE icao_id='TEST'`;
    }

    public static async countDuplicates(): Promise<number> {
        const result = await sql`SELECT COUNT(*) as count, icao_id from Airports WHERE creatorid IS NULL GROUP BY icao_id HAVING COUNT(*) > 1 ORDER BY count DESC`;
        return result.rowCount
    }
}