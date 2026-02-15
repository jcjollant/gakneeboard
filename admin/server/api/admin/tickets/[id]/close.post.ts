import { defineEventHandler, getRouterParam } from 'h3'
import { TicketService } from '@server/backend/services/TicketService'

export default defineEventHandler(async (event) => {
    try {
        const idParam = getRouterParam(event, 'id')
        if (!idParam) {
            throw createError({ statusCode: 400, statusMessage: 'Missing ID param' })
        }

        const id = Number(idParam)
        if (isNaN(id)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
        }

        await TicketService.close(id)
        return { status: 'closed', id }
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to close ticket: ' + e.message
        })
    }
})
