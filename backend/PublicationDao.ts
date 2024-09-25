import { QueryResult, QueryResultRow, sql } from "@vercel/postgres"
import { Publication } from "./models/Publication";
import { PublishedTemplate } from "./models/PublishedTemplate";

export class PublicationDao {
    public static async count(): Promise<number> {
        let result = await sql`SELECT COUNT(*) FROM publications WHERE sheetid IS NOT NULL`
        if( result.rowCount != 1) {
            throw new Error("Invalid count query");
        }
        return Number(result.rows[0].count)
    }

    public static async countAvailable(): Promise<number> {
        let result = await sql`SELECT COUNT(*) as count FROM publications WHERE sheetid IS NULL`
        if( result.rowCount != 1) {
            throw new Error("Invalid count query");
        }
        return Number(result.rows[0]['count'])
    }

    /**
     * Get a list of published templates
     * @param offset if defined will break down the list in chunks of 10 records starting at the given offset
     * @returns a list of published templates
     */
    public static async list(offset:number|undefined=undefined): Promise<PublishedTemplate[]> {
        // request the following data with offset and limit
        // add offset and limit if they are defined
        let result: QueryResult<QueryResultRow>;
        if( offset !== undefined) {
            result = await sql`SELECT p.code, s.name, s.description FROM publications AS p LEFT JOIN sheets AS s on p.sheetid = s.id WHERE p.active = ${true} AND s.user_id IS NOT NULL LIMIT 10 OFFSET ${offset}`
        } else {
            result = await sql`SELECT p.code, s.name, s.description FROM publications AS p LEFT JOIN sheets AS s on p.sheetid = s.id WHERE p.active = ${true} AND s.user_id IS NOT NULL`
        }

        return result.rows.map(row => new PublishedTemplate(row['code'], row['name'], row['description']))
    }

    /**
     * 
     * @param templateId 
     * @returns undefined if a publication code could not be allocated, otherwise, the new publication
     */
    public static async publish(templateId:number):Promise<Publication|undefined> {
        // Do we have an exiting publication for this template ID
        let result = await sql`SELECT id,code FROM publications WHERE sheetid = ${templateId}`
        if( result.rowCount == 0) { // no existing publication
            // find the first available row
            result = await sql`SELECT id,code FROM publications WHERE sheetid IS NULL LIMIT 1`
            if(result.rowCount == 0) return undefined;
            // assign sheet Id to that Publication and make sure it's active
            await sql`UPDATE publications SET sheetid = ${templateId}, active = ${true} WHERE id = ${result.rows[0]['id']}`
        } else { // existing publication
            // make sure it's active
            await sql`UPDATE publications SET active = ${true} WHERE id = ${result.rows[0]['id']}`
        }
        // create a publication from the result
        return new Publication(result.rows[0]['id'], result.rows[0]['code'], templateId, true)
    }

    // unpublish a teamplate (by template Id)
    public static async unpublish(templateId:number):Promise<void> {
        // console.log('[PublicationDao.unpublish]', templateId);
        await sql`UPDATE publications SET active = FALSE WHERE sheetid = ${templateId}`
    }

    /**
     * Find an active publication by it's code
     * @param code Publication code
     * @returns Found publication or undefined if not found
     */
    public static async findByCode(code:string):Promise<Publication|undefined> {
        let result = await sql`SELECT id,sheetid,active FROM publications WHERE code = ${code} AND active`
        if( result.rowCount == 0) return undefined;
        return new Publication(result.rows[0]['id'], code, result.rows[0]['sheetid'], result.rows[0]['active'])
    }

    /**
     * Look for an active publication for a given sheetid
     * @param templateId Template of interest
     * @returns A publication or undefined if that template was not found
     */
    public static async findByTemplate(templateId:number):Promise<Publication|undefined> {
        let result = await sql`SELECT id,code,active FROM publications WHERE sheetid = ${templateId} AND active`
        if( result.rowCount == 0) return undefined;
        return new Publication(result.rows[0]['id'], result.rows[0]['code'], templateId, result.rows[0]['active'])
    }
}