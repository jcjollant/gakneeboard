import { sql } from "@vercel/postgres"
import { Publication } from "./models/Publication";

export class PublicationDao {
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
     * Look for a publication for a given sheetid
     * @param sheetid Sheet of interest
     * @returns A publication or undefined if that sheet was not found
     */
    public static async findPublication(sheetid:number):Promise<Publication|undefined> {
        let result = await sql`SELECT id,code FROM publications WHERE sheetid = ${sheetid}`
        if( result.rowCount == 0) return undefined;
        return new Publication(result.rows[0]['id'], result.rows[0]['code'], sheetid)
    }
}