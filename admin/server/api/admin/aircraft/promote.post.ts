import { defineEventHandler, readBody, createError } from 'h3'
import { AdminAircraftService } from '../../../services/AdminAircraftService'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const aircraftId = Number(body.aircraftId)
        const tailNumber = body.tailNumber
        const copy = !!body.copy

        if (!aircraftId || isNaN(aircraftId)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid aircraftId provided'
            })
        }

        if (!tailNumber) {
            throw createError({
                statusCode: 400,
                statusMessage: 'System tail number (template name) is required for aircraft promotion'
            })
        }

        const success = await AdminAircraftService.promoteAircraft(aircraftId, tailNumber, copy)

        if (!success) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Aircraft not found or promotion failed'
            })
        }

        return { 
            success: true, 
            message: copy 
                ? `Aircraft ${aircraftId} successfully copied to system as ${tailNumber}` 
                : `Aircraft ${aircraftId} promoted to system template as ${tailNumber}` 
        }
    } catch (e: any) {
        if (e.statusCode) throw e
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to promote aircraft: ' + (e.message || e)
        })
    }
})
