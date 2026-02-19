import { defineEventHandler } from 'h3'
import { HouseKeeping } from '@server/backend/maintenance/HouseKeeping'

export default defineEventHandler(async (event) => {
    try {
        console.log('[Maintenance.willie] Manual trigger from Admin')
        const tasks = await HouseKeeping.perform()
        return tasks
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to run Willie: ' + e.message
        })
    }
})
