import { defineEventHandler, createError } from 'h3'
import { UrlService } from '~/utils/UrlService'

export default defineEventHandler(async (event) => {
    const targetUrl = UrlService.healthCheckUrl

    if (!targetUrl) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GAK_API_URL not configured, cannot determine health check URL'
        })
    }

    const config = useRuntimeConfig()
    const headers = {
        'x-health-check-access-key': config.healthCheckAccessKey || ''
    }

    try {
        const response = await $fetch(targetUrl, {
            headers,
            method: 'GET'
        })
        return response
    } catch (e: any) {
        // Return a failing health check object instead of throwing
        return {
            status: 'fail',
            checks: [
                {
                    name: 'API Connectivity',
                    status: 'fail',
                    msg: `Health check request failed with status ${e.status || e.statusCode || 500}: ${e.message || 'Unknown error'}`
                }
            ]
        }
    }
})
