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
