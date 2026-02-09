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

    it('should handle db errors gracefully and return false', async () => {
        (sql as any).mockRejectedValueOnce(new Error("DB Error"));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const result = await TicketService.create(2, "Another message");

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[TicketService] Failed to create ticket:'), expect.any(Error));
        expect(consoleSpy).toHaveBeenCalledWith('[Ticket][2]', "Another message");

        consoleSpy.mockRestore();
    });
    it('should get all open tickets', async () => {
        const mockTickets = [
            { id: 1, create_time: new Date(), severity: 1, message: 'Error 1', status: 'open' },
            { id: 2, create_time: new Date(), severity: 2, message: 'Error 2', status: 'open' }
        ];

        (sql as any).mockResolvedValueOnce({
            rows: mockTickets
        });

        const tickets = await TicketService.getAllOpen();
        expect(tickets.length).toBe(2);
        expect(tickets[0].message).toBe('Error 1');
        expect(tickets[1].severity).toBe(2);
        expect(sql).toHaveBeenCalled();
    });
    it('should truncate long messages', () => {
        const shortMessage = "Short message";
        expect(TicketService.truncateMessage(shortMessage)).toBe(shortMessage);

        const exactMessage = "a".repeat(65536);
        expect(TicketService.truncateMessage(exactMessage)).toBe(exactMessage);

        const longMessage = "a".repeat(66000);
        const truncated = TicketService.truncateMessage(longMessage);

        expect(truncated.length).toBeLessThanOrEqual(65536);
        // Suffix length logic is dynamic, just check it ends with the suffix pattern
        expect(truncated).toMatch(/\[\.\.\. \d+ chars\]$/);
    });

    it('should calculate correct truncation length', () => {
        const length = 70000;
        const message = "a".repeat(length);
        const truncated = TicketService.truncateMessage(message);

        expect(truncated.length).toBeLessThanOrEqual(65536);
        // Verify the number in the suffix matches removed count
        const match = truncated.match(/\[\.\.\. (\d+) chars\]/);
        expect(match).not.toBeNull();
        const removedCount = parseInt(match![1]);
        const keptLength = truncated.indexOf(' [... ');

        expect(message.length).toBe(keptLength + removedCount);
    });
});
