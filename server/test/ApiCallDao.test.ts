import { describe, expect, it, jest } from '@jest/globals';
import { ApiCallDao, ApiName } from '../backend/dao/ApiCallDao';

// Mock sql from @vercel/postgres
jest.mock('@vercel/postgres', () => {
    return {
        sql: jest.fn((strings: TemplateStringsArray, ...values: any[]) => {
            return Promise.resolve({ rows: [{ count: 42 }], rowCount: 1 });
        }),
        db: {
            connect: jest.fn(() => ({
                query: jest.fn(() => ({
                    rows: [
                        { api: 'adip', count: 10 },
                        { api: 'skyvector', count: 5 }
                    ]
                })),
                release: jest.fn()
            }))
        }
    };
});

describe('ApiCallDao', () => {
    it('count should return a number', async () => {
        const count = await ApiCallDao.count(ApiName.Nms);
        expect(count).toBe(42);
    });

    it('countSinceByType should return a record of counts', async () => {
        const counts = await ApiCallDao.countSinceByType(28);
        expect(counts[ApiName.Adip]).toBe(10);
        expect(counts[ApiName.Skyvector]).toBe(5);
        expect(counts[ApiName.Nms]).toBeUndefined(); // as mocked
    });
});
