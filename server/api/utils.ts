import { Response } from "express"
import { GApiError } from "../backend/GApiError";
import { TicketService } from "../backend/services/TicketService";
import { Ticket } from "../backend/models/Ticket";

/**
 * Prints an error in the console and send an error response
 * @param {*} res 
 * @param {*} e 
 * @param {*} context
 */
export async function catchError(res: Response, e: any, context: string, ticket?: Ticket): Promise<void> {
    // console.log( "[index] " + msg + " error " + JSON.stringify(e))
    let status = 500
    let message = e
    if (e instanceof GApiError) {
        status = e.status
        message = e.message
    }
    res.status(status).send(message)

    if (status === 401) {
        // Don't create tickets for unauthorized requests (bots, sessions expired, etc.)
        return
    }

    let ticketMessage = message + ' ' + context
    
    // Decorate with underlying API error details if this is an AxiosError
    if (e && typeof e === 'object' && e.isAxiosError) {
        const method = e.config?.method?.toUpperCase() || 'UNKNOWN'
        const url = e.config?.url || 'UNKNOWN URL'
        const respStatus = e.response?.status || 'No Response'
        ticketMessage += `\nUnderlying API failure: ${method} ${url} (Status: ${respStatus})`
    }

    if (e instanceof Error && e.stack) {
        ticketMessage += '\n\nStack:\n' + e.stack
    }

    if (ticket) {
        await TicketService.createFromTicket(ticket)
    } else {
        await TicketService.create(3, ticketMessage)
    }
}
