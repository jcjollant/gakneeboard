import { sql } from "@vercel/postgres"
import { Template } from "./models/Template";

export class TemplateDao {
    static modelVersion:number = 1;

    static maxSheets:number = 10

    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM Sheets`;
        return Number(result.rows[0].count)
    }

    /**
     * Create a new Sheet or update and existing one for a given user.
     * @param template 
     * @param userId 
     * @returns 
     */
    public static async createOrUpdate(template:Template,userId:number):Promise<Template> {
        if(!template) throw new Error("No sheet provided");
        // Figure out a sheet id if it's not readily provided
        if(!template.id) {
            // if the id is not provided, fetch by name
            const pageId:number|undefined = await TemplateDao.findByName( template.name, userId)
            if( pageId) {
                template.id = pageId;
            }    
        }
        // data contains the whole object
        const data:string = JSON.stringify(template.data);
        if( template.id) {
            // console.log( "[SheetDao.createOrUpdate] updating", pageId);
            await sql`
                UPDATE sheets SET data=${data},name=${template.name} WHERE id=${template.id}
            `
        } else {
            // console.log( "[SheetDao.createOrUpdate] net new");
            // count the number of sheets for this user
            const r1 = await sql`SELECT COUNT(*) AS count FROM sheets WHERE user_id=${userId};`
            const count = r1.rows[0]['count'] as number;
            if( count >= TemplateDao.maxSheets && userId != 1) throw new Error("Maximum number of sheets reached");
            const result = await sql`
                INSERT INTO sheets (name, data, version, user_id)
                VALUES (${template.name}, ${data}, ${this.modelVersion}, ${userId})
                RETURNING id;
            `
            template.id = result.rows[0]['id']
        }
        return template
    }

    /**
     * Delete a sheet for a given user
     * @param templateId 
     * @param userId 
     */
    public static async delete(templateId:number, userId:number):Promise<number> {
        sql`
            DELETE FROM sheets WHERE id=${templateId} AND user_id=${userId};
        `
        return templateId
    }

    /**
     * Finds a template from its name and owner id
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

    public static async getAllTemplateData():Promise<Template[]> {
        const result = await sql`
            SELECT id,data,name FROM sheets;
        `
        return result.rows.map((row) => new Template(row['id'], row['name'], row['data']));
    }

    /**
     * Gets a list of pages for a given user. The list is returned as an array of 
     * objects without the sheet data
     * @param userId 
     * @returns list of found sheets
     */
    public static async getListForUser(userId:number):Promise<Template[]> {
        // console.log('[SheetDao.getListForUser] user', userId)
        return await sql`
            SELECT sheets.id as id,name,publications.code as code FROM sheets LEFT JOIN publications ON sheets.id=publications.sheetid WHERE user_id=${userId}
        `.then( (result) => {
            // console.log('[SheetDao.getListForUser]', result.rowCount)
            if(result.rowCount) {
                return result.rows.map( (row) => new Template(row['id'], row['name'], [], row['code'] != null, row['code']))
            } else {
                return []
            }
        })
    }

    /**
     * Find template by it's Id and user
     * @param templateId 
     * @param userId 
     * @returns 
     */
    public static async readById(templateId:number, userId:number|undefined=undefined):Promise<Template|undefined> {
        let result:any;
        if(userId) {
            result = await sql`
                SELECT data,name FROM sheets WHERE id=${templateId} AND user_id=${userId};
            `
        } else {
            result = await sql`
                SELECT data,name FROM sheets WHERE id=${templateId};
            `
        }
        if( result.rowCount == 0) return undefined

        const row = result.rows[0];
        return new Template( templateId, row['name'], row['data']);
    }
}