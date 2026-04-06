import { defineEventHandler } from 'h3'
import { HousekeepingDao } from '@server/backend/dao/HousekeepingDao'

export default defineEventHandler(async (event) => {
    try {
        const dao = new HousekeepingDao()
        const history = await dao.getAll()
        return history
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch housekeeping history: ' + e.message
        })
    }
})
