import { sql } from "@vercel/postgres"
import { Template } from "../models/Template"
import { Dao } from "./Dao"

export enum TemplateOperation {
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export class TemplateHistory {
    id: number
    templateId: number
    userId: number
    data: any
    name: string
    version: number
    description: string | undefined
    pages: number
    thumbnail: string | undefined
    thumbhash: string | undefined
    operation: TemplateOperation
    createdAt: Date

    constructor(
        id: number,
        templateId: number,
        userId: number,
        data: any,
        name: string,
        version: number,
        description: string | undefined,
        pages: number,
        thumbnail: string | undefined,
        thumbhash: string | undefined,
        operation: TemplateOperation,
        createdAt: Date
    ) {
        this.id = id
        this.templateId = templateId
        this.userId = userId
        this.data = data
        this.name = name
        this.version = version
        this.description = description
        this.pages = pages
        this.thumbnail = thumbnail
        this.thumbhash = thumbhash
        this.operation = operation
        this.createdAt = createdAt
    }
}

export class TemplateHistoryDao extends Dao<TemplateHistory> {
    protected tableName: string = 'template_history'

    /**
     * Save a template to the history table before it's updated or deleted
     * @param template The template to save
     * @param operation The operation being performed (UPDATE or DELETE)
     */
    public static async saveHistory(template: Template, operation: TemplateOperation): Promise<void> {
        try {
            await sql`
                INSERT INTO template_history (
                    template_id, 
                    user_id, 
                    data, 
                    name, 
                    version, 
                    description, 
                    pages, 
                    thumbnail, 
                    thumbhash, 
                    operation
                ) VALUES (
                    ${template.id}, 
                    ${template.userId}, 
                    ${JSON.stringify(template.data)}, 
                    ${template.name}, 
                    ${template.version}, 
                    ${template.description}, 
                    ${template.pages}, 
                    ${template.thumbnail}, 
                    ${template.thumbhash}, 
                    ${operation}
                )
            `
            // console.log(`[TemplateHistoryDao.saveHistory] Saved template ${template.id} history for ${operation} operation`)
        } catch (error) {
            console.error(`[TemplateHistoryDao.saveHistory] Error saving template history: ${error}`)
            // We don't want to throw an error here as it would prevent the main operation
            // Just log the error and continue
        }
    }

    /**
     * Get history entries for a specific template
     * @param templateId The template ID to get history for
     * @returns Array of TemplateHistory objects
     */
    public async getHistoryForTemplate(templateId: number): Promise<TemplateHistory[]> {
        const result = await sql`
            SELECT * FROM ${this.tableName} 
            WHERE template_id = ${templateId}
            ORDER BY created_at DESC
        `
        return result.rows.map(row => this.parseRow(row))
    }

    /**
     * Get history entries for a specific user
     * @param userId The user ID to get history for
     * @returns Array of TemplateHistory objects
     */
    public async getHistoryForUser(userId: number): Promise<TemplateHistory[]> {
        const result = await sql`
            SELECT * FROM ${this.tableName} 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `
        return result.rows.map(row => this.parseRow(row))
    }

    /**
     * Parse a database row into a TemplateHistory object
     * @param row The database row
     * @returns TemplateHistory object
     */
    public parseRow(row: any): TemplateHistory {
        return new TemplateHistory(
            row.id,
            row.template_id,
            row.user_id,
            typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
            row.name,
            row.version,
            row.description,
            row.pages,
            row.thumbnail,
            row.thumbhash,
            row.operation as TemplateOperation,
            row.created_at
        )
    }
    /**
     * Get a specific version of a template from history
     * @param templateId The template ID
     * @param version The version number
     * @returns TemplateHistory object or undefined if not found
     */
    public async getTemplateVersion(templateId: number, version: number): Promise<TemplateHistory | undefined> {
        // console.debug(`[TemplateHistoryDao.getTemplateVersion] Getting version ${version} for template ${templateId}`)
        const query = `SELECT * FROM ${this.tableName} WHERE template_id = ${templateId} AND version = ${version}`
        // console.debug('[TemplateHistoryDao.getTemplateVersion]', query)
        const result = await this.db.query(query)
        if (result.rows.length === 0) return undefined
        return this.parseRow(result.rows[0])
    }

    /**
     * Clean up old template history entries, keeping only the most recent ones.
     * Hard limit of 10 entries per template.
     * @returns Number of rows deleted
     */
    public static async cleanHistory(desiredLimit?: number): Promise<number> {
        const limit = desiredLimit ? Math.max(10, desiredLimit) : 10 // Hard threshold of 10 entries per template
        try {
            // Delete entries where row number is greater than the limit when ordered by created_at DESC per template_id
            const result = await sql`
                DELETE FROM template_history
                WHERE id IN (
                    SELECT id
                    FROM (
                        SELECT id, ROW_NUMBER() OVER (PARTITION BY template_id ORDER BY created_at DESC) as rn
                        FROM template_history
                    ) t
                    WHERE rn > ${limit}
                )
            `
            return result.rowCount || 0
        } catch (error) {
            console.error(`[TemplateHistoryDao.cleanHistory] Error cleaning template history: ${error}`)
            return 0
        }
    }
}
