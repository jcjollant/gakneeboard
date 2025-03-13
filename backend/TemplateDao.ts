import { sql } from "@vercel/postgres"
import { Template } from "./models/Template";
import { UserTemplateData } from "./models/UserTemplateData";
import { Dao } from "./dao/Dao";
import { TemplateView } from "./models/TemplateView";
import { template } from "@babel/core";

export class TemplateDao extends Dao<Template> {
    protected tableName: string = 'sheets';

    static modelVersion:number = 1;

    public static async countForUser(userId:number):Promise<number> {
        const result = await sql`SELECT COUNT(*) FROM sheets WHERE user_id=${userId}`
        return Number(result.rows[0].count)
    }

    /**
     * Create a new Sheet or update and existing one for a given user.
     * @param templateView 
     * @param userId 
     * @returns 
     */
    public static async createOrUpdate(templateView:TemplateView,userId:number):Promise<Template> {

        const template = Template.fromView(templateView, userId)
        template.version++;
        if( templateView.id) {
            // console.log( "[SheetDao.createOrUpdate] updating", pageId);
            const result = await sql`
                UPDATE sheets SET data=${JSON.stringify(template.data)},name=${template.name},description=${template.description},pages=${template.pages},version=${template.version} WHERE id=${template.id} AND user_id=${template.userId}
            `
            // we should update something
            if( result.rowCount == 0) {
                throw new Error("Invalid template id")
            }
        } else { // new Tempalte creation
            const result = await sql`
                INSERT INTO sheets (name, data, description, pages, version, user_id)
                VALUES (${template.name}, ${JSON.stringify(template.data)}, ${template.description}, ${template.pages}, 1, ${template.userId})
                RETURNING id;
            `
            template.id = result.rows[0]['id']
        }
        return template
    }

    /**
     * Delete a specific template for a given user
     * @param templateId Template id
     * @param userId Template owner
     * @return Deleted template Id or 0 if no match where found
     */
    public static async delete(templateId:number, userId:number):Promise<number> {
        const result = await sql`
            DELETE FROM sheets WHERE id=${templateId} AND user_id=${userId};
        `
        if( result.rowCount == 0) {
            return 0
        }
        // Free up associated publications
        sql`UPDATE publications SET sheetid=NULL WHERE sheetid=${templateId}`

        return templateId
    }

    /**
     * List all templates for metrics use
     * @returns An overview or template data (id/data)
     */
    public static async getAllTemplateData():Promise<TemplateView[]> {
        const result = await sql`SELECT id,data FROM sheets`
        return result.rows.map((row) => new TemplateView(row['id'], '', row['data']));
    }

    /**
     * Find a template for a given user
     * @param templateId 
     * @param userId 
     * @returns 
     */
    // public async getForUser(templateId:number, userId:number):Promise<Template> {
    //     return new Promise<Template>(async (resolve, reject) => {
    //         const result = await this.db.query(`SELECT * FROM ${this.tableName} WHERE id=${templateId} AND user_id=${userId}`)
    //         if( result.rowCount == 0)
    //             return reject("Not Found")
    //         const row = result.rows[0]
    //         resolve( this.parseRow(row))
    //     })
    // }

    /**
     * Gets a list of pages for a given user. The list is returned as an array of objects without data nor version
     * A joint is performed with the publications table to get the publication status
     * @param userId 
     * @returns list of found sheets which could be empty
     */
    public static async getOverviewListForUser(userId:number):Promise<TemplateView[]> {
        // console.log('[SheetDao.getListForUser] user', userId)
        return await sql`
            SELECT s.id,s.name,s.description,s.pages,p.active,p.code as code FROM sheets AS s LEFT JOIN publications AS p ON s.id = p.sheetid WHERE user_id=${userId}
        `.then( (result) => {
            // console.log('[SheetDao.getListForUser]', result.rowCount)
            if(result.rowCount) {
                return result.rows.map( (row) => new TemplateView(row['id'], row['name'], [], row['description'], 0, row['active'], row['code'], row['pages']))
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

    public parseRow(row: any): Template {
        return new Template(row['id'], row['user_id'], row['data'], row['name'], row['description'], row['version'], row['pages'], row['creation_date'])
    }

    /**
     * Find template by it's Id and user
     * @param templateId 
     * @param userId 
     * @returns 
     */
    public static async readById(templateId:number, userId:number|undefined=undefined):Promise<TemplateView|undefined> {
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
        return new TemplateView( templateId, row['name'], row['data'], row['description'], row['version']);
    }
}