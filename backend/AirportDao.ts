import { QueryResult, sql } from  "@vercel/postgres";
import { Airport } from "./models/Airport";

export class AirportDao {
    
    public static async create(code:string, data:any) {
        // console.log( '[AirportDao.create] ' + code)
        await sql`INSERT INTO Airports (Code, Data, Version) VALUES (${code}, ${data},${data.version})`;
    }

    /**
     * Create a new custom airport or update an existing one
     * @param airport 
     * @param creatorId 
     * @returns the airport code
     */
    public static async createOrUpdateCustom(airport:Airport, creatorId:number):Promise<string> {
        console.log( "[AirportDao] createOrUpdateCustom " + airport.code + " / " + creatorId);
        const customId:number|undefined = await AirportDao.findCustom( airport.code, creatorId)
        const data:string = JSON.stringify(airport);
        if( customId) {
            console.log( "[AirportDao] createOrUpdateCustom updating", customId);
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
    public static async readList(list:any, creatorId:number|undefined=undefined):Promise<any> {
        // console.log( '[AirportDao.readList] ' + JSON.stringify(list) + ' / ' + creatorId)

        let result:QueryResult;
        if( creatorId) {
            result = await sql`SELECT code,data,creatorId FROM airports WHERE Code = ANY (${list}) AND (creatorId =${creatorId} OR creatorId IS NULL) `;
        } else { // do not include creatorId
            result = await sql`SELECT code,data,creatorId FROM airports WHERE Code = ANY (${list}) AND creatorId is NULL`;
        }
        // console.log( '[AirportDoa.readList] found ' + result.rowCount + ' entries for ' + JSON.stringify(list))
    
        const output:any[] = []
        list.forEach( (code:string) => {
            // did we find that code in DB ?
            const found = result.rows.find( row => row.code == code)
            if( found) {
                const airport:Airport = JSON.parse(found.data);
                // console.log('[AirportDao.readList] found.creatorId', found.creatorId)
                airport.custom = ( creatorId ? (creatorId == found.creatorid) : false)
                output.push(airport)
            } else {
                output.push(AirportDao.undefinedAirport(code))
            }
        })
    
        return output
    }

    static undefinedAirport(code:string) {
        return { code : code, version : -1}
    }

    public static async deleteCustom(code:string, creatorId:number) {
        await sql`
            DELETE FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
    }
}