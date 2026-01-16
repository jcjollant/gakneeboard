import { describe, expect, it, jest } from '@jest/globals';
import { TemplateDao } from '../backend/TemplateDao';
import { TemplateView } from '../backend/models/TemplateView';

// Mock sql function
const mockSql = jest.fn() as any;
jest.mock('@vercel/postgres', () => ({
    sql: ((strings: TemplateStringsArray, ...values: any[]) => mockSql(strings, ...values)) as any
}));

describe('TemplateDao', () => {
    describe('getOverviewListForUser', () => {
        it('should populate version from database', async () => {
            const userId = 123;
            // Mock DB response
            const dbRows = [
                {
                    id: 1,
                    name: 'Template 1',
                    description: 'Desc 1',
                    pages: 5,
                    format: 'A4',
                    thumbnail: 'thumb.jpg',
                    thumbhash: 'hash123',
                    active: true,
                    code: 'ABC',
                    version: 42 // This is the value we want to verify
                }
            ];

            mockSql.mockResolvedValue({
                rowCount: 1,
                rows: dbRows
            });

            const result = await TemplateDao.getOverviewListForUser(userId);

            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(TemplateView);
            expect(result[0].id).toBe(1);
            // Verify version is populated
            // Currently implementation passes 0, so this expectation mirrors the bug/missing feature or the desired state
            // Let's expect the correct version (42) and see it fail if it's currently 0
            expect(result[0].ver).toBe(42);
        });
    });
});
