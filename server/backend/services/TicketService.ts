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
            await sql`INSERT INTO tickets (severity, message, status) VALUES (${severity}, ${message}, 'open')`;
            console.log('[TicketService][' + severity + ']', message);
        } catch (error) {
            console.error('[TicketService] Failed to create ticket:', error);
            // Fallback logging if DB fails
            console.error('[Ticket][' + severity + ']', message);
        }
    }

    /**
     * Close a ticket by ID.
     * @param id Ticket ID
     */
    public static async close(id: number): Promise<void> {
        try {
            await sql`UPDATE tickets SET status = 'closed' WHERE id = ${id}`;
        } catch (error) {
            console.error('[TicketService] Failed to close ticket:', error);
            throw error;
        }
    }

    /**
     * Count the number of open tickets.
     */
    public static async countOpenTickets(): Promise<number> {
        try {
            const result = await sql`SELECT COUNT(*) FROM tickets WHERE status = 'open'`;
            return Number(result.rows[0].count);
        } catch (error) {
            console.error('[TicketService] Failed to count open tickets:', error);
            return 0;
        }
    }

    /**
     * Get all open tickets.
     */
    public static async getAllOpen(): Promise<Ticket[]> {
        try {
            const result = await sql`SELECT * FROM tickets WHERE status = 'open' ORDER BY create_time DESC`;
            return result.rows.map(row => new Ticket(
                row.id,
                row.create_time,
                row.severity,
                row.message,
                row.status
            ));
        } catch (error) {
            console.error('[TicketService] Failed to get all open tickets:', error);
            return [];
        }
    }
}
