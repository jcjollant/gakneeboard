import { sql } from "@vercel/postgres"
import { Sheet } from "./models/Sheet";

export class SheetDao {
    static modelVersion:number = 1;

    public static async createOrUpdate(name:string,pageData:any,userId:number):Promise<string> {
        const pageId:number|undefined = await SheetDao.find( name, userId)
        const data:string = (typeof pageData === 'string' ? pageData : JSON.stringify(pageData));
        if( pageId) {
            console.log( "[PageDao.createOrUpdate] updating", pageId);
            await sql`
                UPDATE sheets SET data=${data} WHERE id=${pageId}
            `

        } else {
            console.log( "[PageDao.createOrUpdate] net new");
            await sql`
                INSERT INTO sheets (name, data, version, user_id)
                VALUES (${name}, ${data}, ${this.modelVersion}, ${userId});
            `
        }
        return name

    }

    /**
     * Finds a custom page from its name and owner id
     * @param pageName 
     * @param userId 
     * @returns page Id if found, undefined otherwise
     */
    public static async find(pageName:string, userId:number):Promise<number|undefined> {
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
        return await sql`
            SELECT id,name,data FROM sheets WHERE user_id=${userId};
        `.then( (result) => {
            if(result.rowCount) {
                return result.rows.map( (row) => new Sheet(row['id'], row['name'], row['data']))
            } else {
                return []
            }
        })
    }

    /**
     * Reads a user page from its name and owner id
     * @param pageName 
     * @param userId 
     * @returns a string representing the page data if found, undefined otherwise
     */
    public static async readByName(pageName:string, userId:number):Promise<string|undefined> {
        const result = await sql`
            SELECT data FROM sheets WHERE name=${pageName} AND user_id=${userId};
        `
        if( result.rowCount == 0) return undefined

        return result.rows[0]['data'];
    }

    public static async readById(pageId:number, userId:number):Promise<string|undefined> {
        const result = await sql`
            SELECT data FROM sheets WHERE id=${pageId} AND user_id=${userId};
        `
        if( result.rowCount == 0) return undefined

        return result.rows[0]['data'];
    }
}