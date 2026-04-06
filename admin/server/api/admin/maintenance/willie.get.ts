import { defineEventHandler } from 'h3'
import { Maintenance } from '@server/backend/maintenance/Maintenance'

export default defineEventHandler(async (event) => {
    try {
        console.log('[Maintenance.willie] Manual trigger from Admin')
        // We call willie with sendEmail=false to avoid spam, but persistRecord=true (default)
        const result = await Maintenance.willie(false, true)
        return result.tasks
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to run Willie: ' + e.message
        })
    }
})
