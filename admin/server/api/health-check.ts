import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Replicating UrlService logic to ensure availability in server context
    const postgresUrl = config.public.POSTGRES_URL || ''

    let targetUrl = ''
    if (postgresUrl.includes('ep-shrill-silence-a6ypne6y-pooler')) { // Prod
        targetUrl = 'https://api.kneeboard.ga/admin/healthCheck'
    } else if (postgresUrl.includes('ep-proud-field-a6tfe60l-pooler')) { // Test
        targetUrl = 'http://localhost:3000/admin/healthCheck'
    }

    if (!targetUrl) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Unknown environment, cannot determine health check URL'
        })
    }

    const headers = {
        'x-health-check-access-key': process.env.HEALTH_CHECK_ACCESS_KEY || ''
    }

    try {
        const response = await $fetch(targetUrl, {
            headers,
            method: 'GET'
        })
        return response
    } catch (e: any) {
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.message || 'Health check failed',
            data: e.data
        })
    }
})
