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
    const accessKey = config.healthCheckAccessKey || ''

    if (!accessKey) {
        console.error('[Admin HealthCheck] HEALTH_CHECK_ACCESS_KEY is missing in runtimeConfig')
    }

    const headers = {
        'x-health-check-access-key': accessKey
    }

    try {
        const response = await $fetch(targetUrl, {
            headers,
            method: 'GET'
        })
        return response
    } catch (e: any) {
        // Return a failing health check object instead of throwing
        const statusCode = e.status || e.statusCode || 500
        const isAuthError = statusCode === 401
        let errorMessage = e.message || 'Unknown error'

        // Check if the API server specifically told us the key is missing there
        const responseData = e.data || ''
        const errorText = typeof responseData === 'string' ? responseData : (responseData.statusMessage || JSON.stringify(responseData))

        if (isAuthError && errorText.includes('HEALTH_CHECK_ACCESS_KEY not set on server')) {
            errorMessage = 'HEALTH_CHECK_ACCESS_KEY is missing on the API server.'
        } else if (isAuthError) {
            errorMessage = `Authorization failed (401). Check that HEALTH_CHECK_ACCESS_KEY matches on both Admin and API servers. (Key present in Admin: ${!!accessKey})`
        } else {
            errorMessage = `Health check request failed with status ${statusCode}: ${e.message || 'Unknown error'}`
        }

        return {
            status: 'fail',
            checks: [
                {
                    name: 'API Connectivity',
                    status: 'fail',
                    msg: errorMessage
                }
            ]
        }
    }
})
