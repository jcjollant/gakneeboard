import { describe, expect, it, afterAll, beforeAll } from '@jest/globals';
import { sql } from '@vercel/postgres';
import { TemplateHistoryDao, TemplateOperation } from '../../backend/dao/TemplateHistoryDao';
import * as dotenv from 'dotenv';

dotenv.config();
// Force test DB
process.env.POSTGRES_URL = process.env.POSTGRES_TEST_URL;

describe('TemplateHistoryCleanup Integration', () => {
    const testTemplateId = 999999;
    const testUserId = 888888;

    beforeAll(async () => {
        // Clean up any existing test data
        await sql`DELETE FROM template_history WHERE template_id = ${testTemplateId}`;
    });

    afterAll(async () => {
        // Cleanup
        await sql`DELETE FROM template_history WHERE template_id = ${testTemplateId}`;
        await sql.end();
    });

    it('should keep only the 10 most recent entries per template', async () => {
        // 1. Insert 15 history entries for the test template
        // We use a loop and wait a tiny bit to ensure different created_at if the DB relies on it for ordering
        for (let i = 1; i <= 15; i++) {
            await sql`
                INSERT INTO template_history (
                    template_id, 
                    user_id, 
                    data, 
                    name, 
                    version, 
                    operation,
                    created_at
                ) VALUES (
                    ${testTemplateId}, 
                    ${testUserId}, 
                    '{}', 
                    ${'Test Template ' + i}, 
                    ${i}, 
                    ${TemplateOperation.UPDATE},
                    ${new Date(Date.now() - (20 - i) * 1000).toISOString()} -- Set dates in the past, i=15 is most recent
                )
            `;
        }

        // Verify we have 15 entries
        const initialCount = await sql`SELECT COUNT(*) FROM template_history WHERE template_id = ${testTemplateId}`;
        expect(Number(initialCount.rows[0].count)).toBe(15);

        // 2. Run cleanup
        const deletedRows = await TemplateHistoryDao.cleanHistory();
        expect(deletedRows).toBeGreaterThanOrEqual(5); // At least 5 deleted for this template

        // 3. Verify final count
        const finalCount = await sql`SELECT COUNT(*) FROM template_history WHERE template_id = ${testTemplateId}`;
        expect(Number(finalCount.rows[0].count)).toBe(10);

        // 4. Verify that the REMAINING ones are the LATEST ones (version 6 to 15)
        const remaining = await sql`SELECT version FROM template_history WHERE template_id = ${testTemplateId} ORDER BY version ASC`;
        const versions = remaining.rows.map(r => Number(r.version));
        expect(versions).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });
});
