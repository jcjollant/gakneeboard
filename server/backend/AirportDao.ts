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

    public static async create(code: string, airport: Airport) {
        // console.log( '[AirportDao.create] ' + code)
        const result = await sql`INSERT INTO Airports (Code, Data, Version, Source) VALUES (${code}, ${JSON.stringify(airport)},${airport.version}, ${airport.source}) RETURNING id`;
        airport.id = result.rows[0].id;
    }

    public static async createUnknown(code: string): Promise<void> {
        // console.log( '[AirportDao.createUnknown] ' + code)
        await sql`INSERT INTO Airports (Code,Version) VALUES (${code},${versionInvalid})`;
    }

    /**
     * Create a new custom airport or update an existing one
     * @param airport 
     * @param creatorId 
     * @returns the airport code
     */
    public static async createOrUpdateCustom(airport: Airport, creatorId: number): Promise<string> {
        // console.log( "[AirportDao] createOrUpdateCustom " + airport.code + " / " + creatorId);
        const customId: number | undefined = await AirportDao.findCustom(airport.code, creatorId)
        const data: string = JSON.stringify(airport);
        if (customId) {
            // console.log( "[AirportDao] createOrUpdateCustom updating", customId);
            await sql`
                UPDATE airports SET data=${data}, version=${airport.version}, source=${airport.source} WHERE id=${customId}
            `

        } else {
            // console.log( "[AirportDao] createCustom net new");
            await sql`
                INSERT INTO airports (code, data, version, creatorid, source)
                VALUES (${airport.code}, ${data}, ${airport.version}, ${creatorId}, ${airport.source});
            `
        }
        return airport.code
    }



    /**
     * Looks for cutom airport by code and creator id
     * @param code airport code
     * @param creatorId creator Id (not sha256)
     * @returns the airport id if found, undefined otherwise
     */
    public static async findCustom(code: string, creatorId: number): Promise<number | undefined> {
        // console.log( "[AirportDao] findCustom " + code + " / " + creatorId);
        const result = await sql`
            SELECT id FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
        if (result.rowCount == 0) return undefined

        return result.rows[0]['id'];
    }

    public static parse(row: any, creatorId: number | undefined = undefined): Airport {
        const airport: Airport = row.data ? JSON.parse(row.data) : new Airport(undefined, "", 0);
        // Do we need to salvage the code?
        if (!airport.code) airport.code = row.code;
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
        const result = await sql`SELECT id,code,data,version, source FROM Airports WHERE version = ${Airport.currentVersion}`;
        return result.rows.map(row => {
            const airport: Airport = JSON.parse(row.data)
            airport.id = row.id
            airport.code = row.code
            airport.version = row.version
            airport.source = row.source
            return airport
        }).filter(a => a.effectiveDate === currentEffectiveDate)
    }

    public static async readMissingSketch(limit: number): Promise<Airport[]> {
        const result = await sql`SELECT * FROM airports WHERE sketch ISNULL AND version != -1 LIMIT ${limit}`
        return result.rows.map(row => AirportDao.parse(row))
    }



    public static async readCustom(code: string, creatorId: number): Promise<string | undefined> {
        // console.log( "[AirportDao] readCustom " + code + " / " + creatorId);
        const result = await sql`
            SELECT data FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
        if (result.rowCount == 0) return undefined
        // console.log( "[AirportDao] readCustom " + JSON.stringify(result.rows[0]));

        return result.rows[0]['data'];
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
            result = await sql`SELECT id,code,data,creatorId,version,sketch,source FROM airports WHERE Code = ANY (${list}) AND (creatorId =${creatorId} OR creatorId IS NULL) ORDER BY creatorId`;
        } else { // do not include creatorId
            result = await sql`SELECT id, code,data,creatorId,version,sketch,source FROM airports WHERE Code = ANY (${list}) AND creatorId is NULL`;
        }
        // console.log( '[AirportDoa.readList] found', result.rowCount, 'entries for', JSON.stringify(list))

        const known: CodeAndAirport[] = []
        const knownUnknown: CodeAndAirport[] = []

        result.rows.forEach(row => {
            if (row.data) {
                const airport = AirportDao.parse(row, creatorId)
                known.push(new CodeAndAirport(row.code, airport));
            } else {
                const airport = new Airport(row.code, '', 0)
                airport.version = versionInvalid;
                knownUnknown.push(new CodeAndAirport(row.code, airport));
            }
        })
        const foundCodes = new Set(result.rows.map(row => row.code))
        const missing = (list as string[]).filter(code => !foundCodes.has(code))

        const notFound: string[] = missing;

        return { known, knownUnknown, notFound }
    }

    static async updateSketch(code: string, url: string) {
        if (!code) throw new Error('Invalid code')
        return sql`UPDATE Airports SET sketch=${url} WHERE code=${code}`;
    }


    static async updateAirport(id: number, airport: Airport): Promise<void> {
        const data: string = JSON.stringify(airport)
        // console.debug('[AirportDao.updateAirport] id =', id, ', data =', data)
        await sql`UPDATE Airports SET Data=${data}, Version = ${airport.version} WHERE id=${id}`;
    }



    public static async deleteCustom(code: string, creatorId: number) {
        await sql`
            DELETE FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
    }

    public static async deleteTest() {
        await sql`DELETE FROM airports WHERE code='TEST'`;
    }

    public static async countDuplicates(): Promise<number> {
        const result = await sql`SELECT COUNT(*) as count, Code from Airports WHERE creatorid IS NULL GROUP BY Code HAVING COUNT(*) > 1 ORDER BY count DESC`;
        return result.rowCount
    }
}