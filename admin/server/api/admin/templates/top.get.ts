import { defineEventHandler, getQuery, createError } from 'h3'
import { TemplateDao } from '@server/backend/TemplateDao'

type SortBy = 'creation_date' | 'version' | 'last_save'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const sortBy = (query.sortBy as SortBy) || 'creation_date'

    const validSorts: SortBy[] = ['creation_date', 'version', 'last_save']
    if (!validSorts.includes(sortBy)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid sortBy value' })
    }

    try {
        const dao = new TemplateDao()
        let sql: string

        if (sortBy === 'last_save') {
            // Join usage table on the template id stored in usage.data JSON field
            sql = `
                SELECT s.id, s.name, s.user_id, s.version, s.pages, s.creation_date,
                       MAX(u.create_time) AS last_save
                FROM sheets AS s
                LEFT JOIN usage AS u ON (u.data::jsonb->>'id')::int = s.id AND u.usage_type = 'save'
                GROUP BY s.id, s.name, s.user_id, s.version, s.pages, s.creation_date
                ORDER BY last_save DESC NULLS LAST
                LIMIT 100
            `
        } else if (sortBy === 'version') {
            sql = `
                SELECT id, name, user_id, version, pages, creation_date, NULL AS last_save
                FROM sheets
                ORDER BY version DESC
                LIMIT 100
            `
        } else {
            // creation_date (default)
            sql = `
                SELECT id, name, user_id, version, pages, creation_date, NULL AS last_save
                FROM sheets
                ORDER BY creation_date DESC
                LIMIT 100
            `
        }

        const result = await dao['db'].query(sql)
        return result.rows
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch templates: ' + err.message })
    }
})
