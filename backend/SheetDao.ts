import { sql } from "@vercel/postgres"
import { Sheet } from "./models/Sheet";

export class SheetDao {
    static modelVersion:number = 1;

    /**
     * Create a new Sheet or update and existing one for a given user.
     * @param sheet 
     * @param userId 
     * @returns 
     */
    public static async createOrUpdate(sheet:Sheet,userId:number):Promise<Sheet> {
        if(!sheet) throw new Error("No sheet provided");
        // Figure out a sheet id if it's not readily provided
        if(!sheet.id) {
            const pageId:number|undefined = await SheetDao.findByName( sheet.name, userId)
            if( pageId) {
                sheet.id = pageId;
            }    
        }
        const data:string = JSON.stringify(sheet.data);
        if( sheet.id) {
            // console.log( "[SheetDao.createOrUpdate] updating", pageId);
            await sql`
                UPDATE sheets SET data=${data},name=${sheet.name} WHERE id=${sheet.id}
            `
        } else {
            console.log( "[SheetDao.createOrUpdate] net new");
            const result = await sql`
                INSERT INTO sheets (name, data, version, user_id)
                VALUES (${sheet.name}, ${data}, ${this.modelVersion}, ${userId})
                RETURNING id;
            `
            sheet.id = result.rows[0]['id']
        }
        return sheet
    }

    /**
     * Finds a custom page from its name and owner id
     * @param pageName 
     * @param userId 
     * @returns page Id if found, undefined otherwise
     */
    public static async findByName(pageName:string, userId:number):Promise<number|undefined> {
        const result = await sql`
            SELECT id FROM sheets WHERE name=${pageName} AND user_id=${userId};
        `
        if( result.rowCount == 0) return undefined

        return result.rows[0]['id'];
    }

    /**
     * Gets a list of pages for a given user. The list is returned as an array of 
     * stringified json objects containing the name and id of each page.
     * @param userId 
     * @returns list of found sheets
     */
    public static async getListForUser(userId:number):Promise<Sheet[]> {
        // console.log('[SheetDao.getListForUser] user', userId)
        return await sql`
            SELECT id,name,data FROM sheets WHERE user_id=${userId};
        `.then( (result) => {
            // console.log('[SheetDao.getListForUser]', result.rowCount)
            if(result.rowCount) {
                return result.rows.map( (row) => new Sheet(row['id'], row['name'], row['data']))
            } else {
                return []
            }
        })
    }

    /**
     * Find sheet by it's Id and user
     * @param pageId 
     * @param userId 
     * @returns 
     */
    public static async readById(pageId:number, userId:number):Promise<Sheet|undefined> {
        const result = await sql`
            SELECT data,name FROM sheets WHERE id=${pageId} AND user_id=${userId};
        `
        if( result.rowCount == 0) return undefined

        const row = result.rows[0];
        return new Sheet( pageId, row['name'], row['data']);
    }
}