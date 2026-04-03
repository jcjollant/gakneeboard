import { defineEventHandler, readBody, createError } from 'h3'
import { TicketService } from '@server/backend/services/TicketService'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { severity, message } = body
        
        if (!severity || !message) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Severity and message are required'
            })
        }
        
        const success = await TicketService.create(Number(severity), message)
        if (!success) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to create ticket'
            })
        }
        
        return { status: 'created' }
    } catch (e: any) {
        if (e.statusCode) throw e
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create ticket: ' + e.message
        })
    }
})
