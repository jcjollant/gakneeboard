import { defineEventHandler, readBody } from 'h3'
import { AirportService } from '@server/backend/services/AirportService'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        // body matches { user: string, request: AirportCreationRequest }
        const payload = body.request

        const airport = await AirportService.createAirport(payload)
        return airport
    } catch (e: any) {
        throw createError({
            statusCode: e.status || 500,
            statusMessage: 'Failed to create airport: ' + e.message
        })
    }
})
