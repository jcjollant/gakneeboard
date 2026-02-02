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

        const exactMessage = "a".repeat(1024);
        expect(TicketService.truncateMessage(exactMessage)).toBe(exactMessage);

        const longMessage = "a".repeat(1030);
        const truncated = TicketService.truncateMessage(longMessage);

        expect(truncated.length).toBeLessThanOrEqual(1024);
        expect(truncated.substring(truncated.length - 14)).toBe('[... 21 chars]');
    });

    it('should calculate correct truncation length', () => {
        // Case: 1025 characters. 
        // 1 char removed. Suffix: " [... 1 chars]" (length 15)
        // Kept = 1025 - 1 = 1024? No.
        // Needs total <= 1024.
        // Suffix length for "1 chars" is 14.
        // So kept + 14 <= 1024 => kept <= 1010.
        // Removed = 1025 - 1010 = 15.
        // Suffix = " [... 15 chars]" (length 15).
        // kept + 15 <= 1024 => 1010 + 15 = 1025 > 1024.
        // So kept needs to be smaller.
        // Let the algorithm handle it, just verify the contract.

        const length = 2000;
        const message = "a".repeat(length);
        const truncated = TicketService.truncateMessage(message);

        expect(truncated.length).toBeLessThanOrEqual(1024);
        // Verify the number in the suffix matches removed count
        const match = truncated.match(/\[\.\.\. (\d+) chars\]/);
        expect(match).not.toBeNull();
        const removedCount = parseInt(match![1]);
        const keptLength = truncated.indexOf(' [... ');

        expect(message.length).toBe(keptLength + removedCount);
    });
});
