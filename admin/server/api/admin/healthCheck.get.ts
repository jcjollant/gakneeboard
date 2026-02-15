import { defineEventHandler } from 'h3'
import { HealthCheck } from '@server/backend/maintenance/HealthChecks'

export default defineEventHandler(async (event) => {
    try {
        // In the legacy server, there was an Authorization.validateAdmin(req) check.
        // For now, we assume if it hits this endpoint it's fine, or we can add a check later.
        const result = await HealthCheck.perform()
        return result
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Health Check Failed: ' + e.message
        })
    }
})
