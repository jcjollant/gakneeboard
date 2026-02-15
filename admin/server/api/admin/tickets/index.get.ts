import { defineEventHandler } from 'h3'
import { TicketService } from '@server/backend/services/TicketService'

export default defineEventHandler(async (event) => {
    try {
        const tickets = await TicketService.getAllOpen()
        return tickets
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch tickets: ' + e.message
        })
    }
})
