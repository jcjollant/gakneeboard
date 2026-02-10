import { describe, expect, it, jest } from '@jest/globals';
import { UsageDao, UsageType } from '../backend/dao/UsageDao';

// Mock sql function and its query method
jest.mock('@vercel/postgres', () => {
    const mockQuery = jest.fn();
    const mockSql = Object.assign(
        jest.fn(),
        { query: mockQuery, end: jest.fn() }
    );
    return {
        sql: mockSql
    };
});

import { sql } from '@vercel/postgres';

describe('UsageDao', () => {
    describe('lastUsageDate', () => {
        it('should return the last usage date when usage exists', async () => {
            const usageDao = new UsageDao();
            const userId = 123;
            const usageType = UsageType.Print;
            const expectedDate = new Date('2023-10-27T10:00:00Z');

            (sql.query as jest.Mock).mockResolvedValue({
                rowCount: 1,
                rows: [{ last_usage: expectedDate.toISOString() }]
            } as never);

            const result = await usageDao.lastUsageDate(userId, usageType);

            expect(result).toEqual(expectedDate);
            // Verify query construction somewhat loosely to avoid fragility
            expect(sql.query).toHaveBeenCalledWith(
                expect.stringContaining(`SELECT MAX(create_time) as last_usage FROM usage WHERE user_id=${userId} AND usage_type='${usageType}'`)
            );
        });

        it('should return null when no usage exists', async () => {
            const usageDao = new UsageDao();
            const userId = 456;
            const usageType = UsageType.Export;

            (sql.query as jest.Mock).mockResolvedValue({
                rowCount: 0,
                rows: []
            } as never);

            const result = await usageDao.lastUsageDate(userId, usageType);

            expect(result).toBeNull();
        });

        it('should return null when query returns null', async () => {
            const usageDao = new UsageDao();
            const userId = 789;
            const usageType = UsageType.Session;

            (sql.query as jest.Mock).mockResolvedValue({
                rowCount: 1,
                rows: [{ last_usage: null }]
            } as never);

            const result = await usageDao.lastUsageDate(userId, usageType);

            expect(result).toBeNull();
        });
    });
});
