import { QueryResult, sql } from  "@vercel/postgres";
import { Airport, versionInvalid } from "./models/Airport";
import { version } from "os";

export class AirportDao {
    
    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM Airports`;
        return Number(result.rows[0].count)
    }


    public static async create(code:string, data:any) {
        // console.log( '[AirportDao.create] ' + code)
        await sql`INSERT INTO Airports (Code, Data, Version) VALUES (${code}, ${data},${data.version})`;
    }

    public static async createUnknown(code:string) {
        // console.log( '[AirportDao.createUnknown] ' + code)
        return sql`INSERT INTO Airports (Code,Version) VALUES (${code},${versionInvalid})`;
    }

    /**
     * Create a new custom airport or update an existing one
     * @param airport 
     * @param creatorId 
     * @returns the airport code
     */
    public static async createOrUpdateCustom(airport:Airport, creatorId:number):Promise<string> {
        // console.log( "[AirportDao] createOrUpdateCustom " + airport.code + " / " + creatorId);
        const customId:number|undefined = await AirportDao.findCustom( airport.code, creatorId)
        const data:string = JSON.stringify(airport);
        if( customId) {
            // console.log( "[AirportDao] createOrUpdateCustom updating", customId);
            await sql`
                UPDATE airports SET data=${data}, version=${airport.version} WHERE id=${customId}
            `

        } else {
            // console.log( "[AirportDao] createCustom net new");
            await sql`
                INSERT INTO airports (code, data, version, creatorid)
                VALUES (${airport.code}, ${data}, ${airport.version}, ${creatorId});
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
    public static async findCustom(code:string, creatorId:number):Promise<number|undefined> {
        // console.log( "[AirportDao] findCustom " + code + " / " + creatorId);
        const result = await sql`
            SELECT id FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
        if( result.rowCount == 0) return undefined

        return result.rows[0]['id'];
    }

    public static async readCustom(code:string, creatorId:number):Promise<string|undefined> {
        // console.log( "[AirportDao] readCustom " + code + " / " + creatorId);
        const result = await sql`
            SELECT data FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
        if( result.rowCount == 0) return undefined
        // console.log( "[AirportDao] readCustom " + JSON.stringify(result.rows[0]));

        return result.rows[0]['data'];
    }

    /**
     * Read a list of airports from DB
     * @param list 
     * @param creatorId 
     * @returns 
     */
    public static async readList(list:any, creatorId:number|undefined=undefined):Promise<[string,Airport][]> {
        // console.log( '[AirportDao.readList] ' + JSON.stringify(list) + ' / ' + creatorId)

        let result:QueryResult;
        if( creatorId) {
            result = await sql`SELECT id,code,data,creatorId,version FROM airports WHERE Code = ANY (${list}) AND (creatorId =${creatorId} OR creatorId IS NULL) ORDER BY creatorId`;
        } else { // do not include creatorId
            result = await sql`SELECT id, code,data,creatorId,version FROM airports WHERE Code = ANY (${list}) AND creatorId is NULL`;
        }
        // console.log( '[AirportDoa.readList] found', result.rowCount, 'entries for', JSON.stringify(list))
    
        return result.rows.map( row => {
            if(row.data) {
                const airport:Airport = JSON.parse(row.data);
                // Do we need to salvage the code?
                if(!airport.code) airport.code = row.code;
                // console.log('[AirportDao.readList] found.creatorId', found.creatorId)
                // It's a custom airport if creatorId matches
                airport.custom = ( creatorId ? (creatorId == row.creatorid) : false)
                airport.id = row.id;
                airport.version = row.version;
                return [row.code,airport];
            } else {
                return [row.code,AirportDao.undefinedAirport(row.code)]
            }
        })

        // const output:Airport[] = []

        // list.forEach( (code:string) => {
        //     // did we find that code in DB ?
        //     const found = result.rows.find( row => row.code == code)
        //     if( found) {
        //         const airport:Airport = JSON.parse(found.data);
        //         // Do we need to salvage the code?
        //         if(!airport.code) airport.code = code;
        //         // console.log('[AirportDao.readList] found.creatorId', found.creatorId)
        //         // It's a custom airport if creatorId matches
        //         airport.custom = ( creatorId ? (creatorId == found.creatorid) : false)
        //         airport.id = found.id;
        //         airport.version = found.version;
        //         output.push(airport)
        //     }
        // })
        // // console.log('[AirportDao.readList] returning', output.length, 'records')
        // return output
    }

    static undefinedAirport(code:string):Airport {
        const airport:Airport = new Airport(code, '', 0)
        airport.version = versionInvalid;
        return airport
    }

    static async updateAirport(id:number, airport:Airport) {
        const data:string = JSON.stringify(airport)
        // console.log( '[AirportDao.updateAirport] id =', id, ', data =',  data)
        return sql`UPDATE Airports SET Data=${data}, Version = ${airport.version} WHERE id=${id}`;
    }
    
    

    public static async deleteCustom(code:string, creatorId:number) {
        await sql`
            DELETE FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
    }

    public static async countDuplicates():Promise<number> {
        const result = await sql`SELECT COUNT(*) as count, Code from Airports WHERE creatorid IS NULL GROUP BY Code HAVING COUNT(*) > 1 ORDER BY count DESC`;
        return result.rowCount
    }
}