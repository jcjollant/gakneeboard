import { sql } from "@vercel/postgres"
import { Publication } from "./models/Publication";

export class PublicationDao {
    public static async countAvailable(): Promise<number> {
        let result = await sql`SELECT COUNT(*) as count FROM publications WHERE sheetid IS NULL`
        if( result.rowCount != 1) {
            throw new Error("Invalid count query");
        }
        return Number(result.rows[0]['count'])
    }
    /**
     * 
     * @param sheetid 
     * @returns undefined if a publication code could not be allocated, otherwise, the new publication
     */

    public static async publish(sheetid:number):Promise<Publication|undefined> {
        let result = await sql`SELECT id,code FROM publications WHERE sheetid = ${sheetid}`
        if( result.rowCount == 0) {
            // find the first available row
            result = await sql`SELECT id,code FROM publications WHERE sheetid IS NULL LIMIT 1`
            if(result.rowCount == 0) return undefined;
            await sql`UPDATE publications SET sheetid = ${sheetid} WHERE id = ${result.rows[0]['id']}`
        } 
        // create a publication from the result
        return new Publication(result.rows[0]['id'], result.rows[0]['code'], sheetid)
    }

    public static async unpublish(sheetid:number):Promise<void> {
        await sql`UPDATE publications SET sheetid = NULL WHERE sheetid = ${sheetid}`
    }

    /**
     * Find a publication by it's code
     * @param code Publication code
     * @returns Found publication or undefined if not found
     */
    public static async findByCode(code:string):Promise<Publication|undefined> {
        let result = await sql`SELECT id,sheetid FROM publications WHERE code = ${code}`
        if( result.rowCount == 0) return undefined;
        return new Publication(result.rows[0]['id'], code, result.rows[0]['sheetid'])
    }

    /**
     * Look for a publication for a given sheetid
     * @param sheetid Sheet of interest
     * @returns A publication or undefined if that sheet was not found
     */
    public static async findBySheet(sheetid:number):Promise<Publication|undefined> {
        let result = await sql`SELECT id,code FROM publications WHERE sheetid = ${sheetid}`
        if( result.rowCount == 0) return undefined;
        return new Publication(result.rows[0]['id'], result.rows[0]['code'], sheetid)
    }
}