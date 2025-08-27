import { sql } from "@vercel/postgres"
import { Template } from "./models/Template";
import { UserTemplateData } from "./models/UserTemplateData";
import { Dao } from "./dao/Dao";
import { TemplateView } from "./models/TemplateView";
import { ThumbnailData } from "./models/ThumbnailData";
import { TemplateHistoryDao, TemplateOperation } from "./dao/TemplateHistoryDao";

export class TemplateDao extends Dao<Template> {
    protected tableName: string = 'sheets';

    static modelVersion:number = 1;

    public async countForUser(userId:number):Promise<number> {
        const result = await this.db.query(`SELECT COUNT(*) FROM ${this.tableName} WHERE user_id=${userId}`)
        return Number(result.rows[0].count)
    }

    public static async countForUserStatic(userId:number):Promise<number> {
        return this.getInstance().countForUser(userId)
    }

    public async createOrUpdate(templateView:TemplateView, userId:number):Promise<TemplateView> {
        templateView.ver++;
        if( templateView.id) {
            // Get the current template before updating it
            const currentTemplate = await this.readById(templateView.id, userId);
            
            // If the template exists, save it to history before updating
            if (currentTemplate) {
                await TemplateHistoryDao.saveHistory(currentTemplate, TemplateOperation.UPDATE);
            }
            
            // console.log( "[SheetDao.createOrUpdate] updating", pageId);
            const result = await sql`
                UPDATE sheets SET data=${JSON.stringify(templateView.data)},name=${templateView.name},description=${templateView.desc},pages=${templateView.pages},version=${templateView.ver} WHERE id=${templateView.id} AND user_id=${userId}
            `
            // we should update something
            if( result.rowCount == 0) {
                throw new Error("Invalid template or user id")
            }
        } else { // new Tempalte creation
            const result = await sql`
                INSERT INTO sheets (name, data, format, description, pages, version, user_id)
                VALUES (${templateView.name}, ${JSON.stringify(templateView.data)}, ${templateView.format}, ${templateView.desc}, ${templateView.pages}, 1, ${userId})
                RETURNING id;
            `
            templateView.id = result.rows[0]['id']
        }
        return templateView
    }

    /**
     * Create a new Sheet or update and existing one for a given user.
     * @param templateView 
     * @param userId 
     * @returns 
     */
    public static async createOrUpdateViewStatic(templateView:TemplateView,userId:number):Promise<TemplateView> {
        const templateDao = this.getInstance()
        return templateDao.createOrUpdate(templateView, userId)
    }

    /**
     * Delete a specific template for a given user
     * @param templateId Template id
     * @param userId Template owner
     * @return Deleted template Id or 0 if no match where found
     */
    public async delete(templateId:number, userId:number):Promise<number> {
        // Get the template before deleting it
        const template = await this.readById(templateId, userId);
        
        // If the template exists, save it to history before deleting
        if (template) {
            await TemplateHistoryDao.saveHistory(template, TemplateOperation.DELETE);
        }
        
        const result = await this.db.query(`
            DELETE FROM ${this.tableName} WHERE id=${templateId} AND user_id=${userId};
        `)
        if( result.rowCount == 0) {
            return 0
        }
        // Free up associated publications
        sql`UPDATE publications SET sheetid=NULL WHERE sheetid=${templateId}`

        return templateId
    }

    /**
     * Delete a specific template for a given user
     * @param templateId Template id
     * @param userId Template owner
     * @return Deleted template Id or 0 if no match where found
     */
    public static async deleteStatic(templateId:number, userId:number):Promise<number> {
        const templateDao = new TemplateDao();
        return templateDao.delete(templateId, userId)
    }

    /**
     * List all templates for metrics use
     * @returns An overview or template data (id/data)
     */
    public static async getAllTemplateData():Promise<TemplateView[]> {
        const result = await sql`SELECT id,data FROM sheets`
        return result.rows.map((row) => new TemplateView(row['id'], '', row['data']));
    }

    public async getForUser(userId:number):Promise<Template[]> {
        const result = await this.db.query(`SELECT * FROM ${this.tableName} WHERE user_id=${userId}`)
        return result.rows.map((row) => this.parseRow(row))
    }

    public static getInstance():TemplateDao {
        return new TemplateDao()
    }

    /**
     * Gets a list of pages for a given user. The list is returned as an array of objects without data nor version
     * A joint is performed with the publications table to get the publication status
     * @param userId 
     * @returns list of found sheets which could be empty
     */
    public static async getOverviewListForUser(userId:number):Promise<TemplateView[]> {
        // console.log('[SheetDao.getListForUser] user', userId)
        return await sql`
            SELECT s.id,s.name,s.description,s.pages,s.format,s.thumbnail,s.thumbhash,p.active,p.code as code FROM sheets AS s LEFT JOIN publications AS p ON s.id = p.sheetid WHERE user_id=${userId}
        `.then( (result) => {
            // console.log('[SheetDao.getListForUser]', result.rowCount)
            if(result.rowCount) {
                return result.rows.map( (row) => new TemplateView(row['id'], row['name'], [], row['format'], row['description'], 0, row['active'], row['code'], row['pages'], row['thumbnail'], row['thumbhash']))
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
     * Count pages for a user and template
     * @param userId 
     * @param templateId 
     * @return a tupple with the total number of pages for the designated user and the specific number of pages for one template
     */
    public async pageCount(userId: number, templateId: number): Promise<[number, number]> {
        const result = await this.db.query(`
            SELECT id,pages FROM ${this.tableName} WHERE user_id=${userId};
        `)
        const [total,previous] = result.rows.reduce((acc, row) => {
            acc[0] += row['pages'];
            if(row['id'] == templateId) acc[1] = row['pages'];
            return acc;
        }, [0,0])
        return [total,previous]
    }
    /**
     * Parse a result row into Template instance
     * @param row 
     * @returns 
     */
    public parseRow(row: any): Template {
        return new Template(row['id'], row['user_id'], row['data'], row['format'], row['name'], row['description'], row['version'], row['pages'], row['thumbnail'], row['thumbhash'], row['creation_date'])
    }

    /**
     * Find template by it's Id and user
     * @param templateId 
     * @param userId 
     * @returns 
     */
    public static async readByIdStatic(templateId:number, userId:number|undefined=undefined):Promise<Template|undefined> {
        const templateDao = new TemplateDao();
        return templateDao.readById(templateId, userId)
    }

    /**
     * 
     * @param templateId 
     * @param userId 
     * @returns 
     */
    async readById(templateId:number, userId:number|undefined=undefined):Promise<Template|undefined> {
        let result:any;
        if(userId && userId != 1) {
            result = await this.db.query(`
                SELECT * FROM ${this.tableName} WHERE id=${templateId} AND user_id=${userId};
            `)
        } else {
            result = await this.db.query(`
                SELECT * FROM ${this.tableName} WHERE id=${templateId};
            `)
        }
        if( result.rowCount == 0) return undefined

        const row = result.rows[0];
        return this.parseRow(row)
    }


    /**
     * Update a template thumbnail
     * @param template
     * @returns the new thumbnail url
     */
    public async updateThumbnail(template: Template):Promise<ThumbnailData> {
        const result = await sql`
            UPDATE sheets SET thumbnail=${template.thumbnail},thumbhash=${template.thumbhash} WHERE id=${template.id}
        `
        if( result.rowCount == 0) throw new Error('Template not found')

        return new ThumbnailData(template.thumbnail, template.thumbhash)
    }
}
