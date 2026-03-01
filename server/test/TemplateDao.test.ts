import { describe, expect, it, jest } from '@jest/globals';
import { TemplateDao } from '../backend/TemplateDao';
import { TemplateKneeboardView } from '../backend/models/TemplateKneeboardView';

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
                    version: 42, // This is the value we want to verify
                    route: { dep: 'SEA', dst: 'SFO', alt: 'PDX' }
                }
            ];

            mockSql.mockResolvedValue({
                rowCount: 1,
                rows: dbRows
            });

            const result = await TemplateDao.getOverviewListForUser(userId);

            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(TemplateKneeboardView);
            expect(result[0].id).toBe(1);
            // Verify version and route are populated
            expect(result[0].ver).toBe(42);
            expect(result[0].route).toEqual({ dep: 'SEA', dst: 'SFO', alt: 'PDX' });
        });
    });
});
