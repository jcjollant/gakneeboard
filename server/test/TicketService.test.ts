import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { TicketService } from '../backend/services/TicketService';
import { sql } from "@vercel/postgres";

// Mock sql
jest.mock('@vercel/postgres', () => {
    return {
        sql: jest.fn()
    };
});

describe('TicketService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a ticket via sql', async () => {
        const severity = 1;
        const message = "Test error message";

        await TicketService.create(severity, message);

        // Cannot easily inspect the template literal tag function arguments exactly like this with simple mock
        // But we can check it was called.
        // A better mock for sql template literal would be needed for exact query verification
        expect(sql).toHaveBeenCalled();
    });

    it('should close a ticket', async () => {
        const ticketId = 123;
        await TicketService.close(ticketId);
        expect(sql).toHaveBeenCalled();
    });

    it('should count open tickets', async () => {
        (sql as any).mockResolvedValueOnce({
            rows: [{ count: '5' }]
        });

        const count = await TicketService.countOpenTickets();
        expect(count).toBe(5);
        expect(sql).toHaveBeenCalled();
    });

    it('should handle db errors gracefully', async () => {
        (sql as any).mockRejectedValueOnce(new Error("DB Error"));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await TicketService.create(2, "Another message");

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[TicketService] Failed to create ticket:'), expect.any(Error));
        expect(consoleSpy).toHaveBeenCalledWith('[Ticket][2]', "Another message");

        consoleSpy.mockRestore();
    });
});
