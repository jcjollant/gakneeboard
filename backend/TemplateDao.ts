import { sql } from "@vercel/postgres"
import { Template } from "./models/Template";
import { UserTemplateData } from "./models/UserTemplateData";

export class TemplateDao {
    static modelVersion:number = 1;

    static maxSheets:number = 10

    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM Sheets`;
        return Number(result.rows[0].count)
    }

    public static async countByUser():Promise<[number,number][]> {
        const result = await sql`SELECT user_id, count(*) FROM Sheets GROUP BY user_id ORDER BY count DESC`;
        return result.rows.map( (row) => [Number(row.user_id), Number(row.count)])
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
        template.pages = template.data.length;
        if( template.id) {
            // console.log( "[SheetDao.createOrUpdate] updating", pageId);
            await sql`
                UPDATE sheets SET data=${data},name=${template.name},description=${template.desc},pages=${template.pages},version=version+1 WHERE id=${template.id}
            `
            // increment the version accordingly
            template.ver += 1;
        } else {
            // console.log( "[TemplateDao.createOrUpdate] net new");
            // count the number of sheets for this user
            // const r1 = await sql`SELECT COUNT(*) AS count FROM sheets WHERE user_id=${userId};`
            // const count = r1.rows[0]['count'] as number;
            // if( count >= TemplateDao.maxSheets && userId != 1) throw new Error("Maximum number of sheets reached");
            const result = await sql`
                INSERT INTO sheets (name, data, description, pages, version, user_id)
                VALUES (${template.name}, ${data}, ${template.desc}, ${template.pages}, ${this.modelVersion}, ${userId})
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

    /**
     * List all templates for metrics use
     * @returns An overview or template data (id/data)
     */
    public static async getAllTemplateData():Promise<Template[]> {
        const result = await sql`SELECT id,data FROM sheets`
        return result.rows.map((row) => new Template(row['id'], '', row['data']));
    }

    /**
     * Gets a list of pages for a given user. The list is returned as an array of 
     * objects without data nor version
     * @param userId 
     * @returns list of found sheets
     */
    public static async getOverviewListForUser(userId:number):Promise<Template[]> {
        // console.log('[SheetDao.getListForUser] user', userId)
        return await sql`
            SELECT s.id,s.name,s.description,s.pages,p.active,p.code as code FROM sheets AS s LEFT JOIN publications AS p ON s.id = p.sheetid WHERE user_id=${userId}
        `.then( (result) => {
            // console.log('[SheetDao.getListForUser]', result.rowCount)
            if(result.rowCount) {
                return result.rows.map( (row) => new Template(row['id'], row['name'], [], row['description'], 0, row['active'], row['code'], row['pages']))
            } else {
                return []
            }
        })
    }

    /**
     * @returns A list of user ids and their sheet data
     */
    public static async getTemplateDataByUser():Promise<UserTemplateData[]> {
        const result = await sql`SELECT user_id,pages FROM sheets`
        return result.rows.map((row) => new UserTemplateData(Number(row['user_id']), row['pages']));
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
                SELECT data,name,description,version FROM sheets WHERE id=${templateId} AND user_id=${userId};
            `
        } else {
            result = await sql`
                SELECT data,name,description,version FROM sheets WHERE id=${templateId};
            `
        }
        if( result.rowCount == 0) return undefined

        const row = result.rows[0];
        return new Template( templateId, row['name'], row['data'], row['description'], row['version']);
    }
}