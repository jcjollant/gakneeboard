import { sql } from "@vercel/postgres";
import { Ticket } from "../models/Ticket";

export class TicketService {

    /**
     * Create a new ticket in the database.
     * @param severity Severity level (1-5)
     * @param message Error message or description
     * @returns Promise<boolean> - true if ticket was created successfully, false otherwise
     */
    public static async create(severity: number, message: string): Promise<boolean> {
        try {
            const safeMessage = this.truncateMessage(message);
            await sql`INSERT INTO tickets (severity, message, status) VALUES (${severity}, ${safeMessage}, 'open')`;
            console.log('[TicketService][' + severity + ']', safeMessage);
            return true;
        } catch (error) {
            console.error('[TicketService] Failed to create ticket:', error);
            // Fallback logging if DB fails
            console.error('[Ticket][' + severity + ']', message);
            return false;
        }
    }

    public static async createFromTicket(ticket: Ticket): Promise<boolean> {
        return this.create(ticket.severity, ticket.message);
    }

    public static getTicket(severity: number, message: string): Ticket {
        return new Ticket(0, new Date(), severity, message, 'open');
    }

    /**
     * Truncate the message to prevent DB overflow.
     * Max length is 1024.
     */
    public static truncateMessage(message: string): string {
        const MAX_LENGTH = 65536;
        if (message.length <= MAX_LENGTH) {
            return message;
        }

        // We need to fit: kept_string + " [... NNN chars]" <= 1024
        // Estimate suffix length conservatively.
        // If we keep around 1000 chars, removed is roughly total - 1000.
        // If total is huge, say 1MB, removed is ~1000000 (7 digits).
        // Suffix: " [... 1000000 chars]" -> 5 + 7 + 7 = 19 chars.
        // Let's reserve enough space.

        let removedEstimate = message.length - MAX_LENGTH;
        // Iterate a couple of times to find exact fit (overkill but correct)
        // Or just reserve 30 chars effectively.

        // Let's calculate exact available space.
        // suffix = ` [... ${removed} chars]`

        let keepLength = MAX_LENGTH - 30; // Start conservative
        let removed = message.length - keepLength;
        let suffix = ` [... ${removed} chars]`;

        // Now maximize keepLength such that keepLength + suffix.length <= MAX_LENGTH
        while (keepLength + suffix.length < MAX_LENGTH) {
            keepLength++;
            removed = message.length - keepLength;
            suffix = ` [... ${removed} chars]`;
        }
        // If we overshot (unlikely with loop up), or ensuring safety:
        while (keepLength + suffix.length > MAX_LENGTH) {
            keepLength--;
            removed = message.length - keepLength;
            suffix = ` [... ${removed} chars]`;
        }

        return message.substring(0, keepLength) + suffix;
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
