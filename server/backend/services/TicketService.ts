import { sql } from "@vercel/postgres";
import { Ticket } from "../models/Ticket";

export class TicketService {

    /**
     * Create a new ticket in the database.
     * @param severity Severity level (1-5)
     * @param message Error message or description
     */
    public static async create(severity: number, message: string): Promise<void> {
        try {
            await sql`INSERT INTO tickets (severity, message) VALUES (${severity}, ${message})`;
            console.error('[TicketService][' + severity + ']', message);
        } catch (error) {
            console.error('[TicketService] Failed to create ticket:', error);
            // Fallback logging if DB fails
            console.error('[Ticket][' + severity + ']', message);
        }
    }
}
