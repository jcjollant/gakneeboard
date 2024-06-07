import {sql} from  "@vercel/postgres";
import { Airport } from "./models/Airport";

export class AirportDao {
    /**
     * Create a new custom airport or update an existing one
     * @param airport 
     * @param creatorId 
     */
    public static async createCustom(airport:Airport, creatorId:number) {
        const customId:number|undefined = await AirportDao.findCustom( airport.code, creatorId)
        const data:string = JSON.stringify(airport)
        if( customId) {
            await sql`
                UPDATE airports SET (data=${data}, version=${airport.version}) WHERE id=${customId}
                VALUES (${airport.code}, ${data}, ${airport.version}, ${creatorId});
            `

        } else {
            await sql`
                INSERT INTO airports (code, data, version, creatorid)
                VALUES (${airport.code}, ${data}, ${airport.version}, ${creatorId});
            `
        }
    }

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

    public static async deleteCustom(code:string, creatorId:number) {
        await sql`
            DELETE FROM airports WHERE code=${code} AND creatorid=${creatorId};
        `
    }
}