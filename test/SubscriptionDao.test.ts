import { describe, expect, jest, it } from '@jest/globals'
import { SubscriptionDao } from '../backend/dao/SubscriptionDao';

class TestableSubscriptionDao extends SubscriptionDao {
    public setDb(db: any) {
        this.db = db;
    }
}

describe('SubscriptionDao', () => {
    describe('getNewCustomersLast30Days', () => {
        it('should return count of new customers', async () => {
            const mockResult = { rowCount: 5, rows: [] } as any;
            const mockQuery = jest.fn().mockResolvedValue(mockResult);
            const subscriptionDao = new TestableSubscriptionDao();
            subscriptionDao.setDb({ query: mockQuery });

            const count = await subscriptionDao.getNewCustomersLast30Days();

            expect(count).toBe(5);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("JOIN subscriptions s ON u.customer_id = s.customer_id"));
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("account_type != 'sim'"));
        });

        it('should return 0 when no results', async () => {
            const mockResult = { rowCount: 0, rows: [] } as any;
            const mockQuery = jest.fn().mockResolvedValue(mockResult);
            const subscriptionDao = new TestableSubscriptionDao();
            subscriptionDao.setDb({ query: mockQuery });

            const count = await subscriptionDao.getNewCustomersLast30Days();

            expect(count).toBe(0);
        });
    });

    describe('getChurnLast30Days', () => {
        it('should return count of churned customers', async () => {
            const mockResult = { rowCount: 3, rows: [] } as any;
            const mockQuery = jest.fn().mockResolvedValue(mockResult);
            const subscriptionDao = new TestableSubscriptionDao();
            subscriptionDao.setDb({ query: mockQuery });

            const count = await subscriptionDao.getChurnLast30Days();

            expect(count).toBe(3);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("cancel_at >= EXTRACT(EPOCH FROM NOW() - INTERVAL '120 days')"));
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("cancel_at IS NOT NULL"));
        });

        it('should return 0 when no churned customers', async () => {
            const mockResult = { rowCount: 0, rows: [] } as any;
            const mockQuery = jest.fn().mockResolvedValue(mockResult);
            const subscriptionDao = new TestableSubscriptionDao();
            subscriptionDao.setDb({ query: mockQuery });

            const count = await subscriptionDao.getChurnLast30Days();

            expect(count).toBe(0);
        });
    });

    describe('parseRow', () => {
        it('should parse database row to Subscription object', () => {
            const subscriptionDao = new SubscriptionDao();
            const row = {
                id: 'sub_123',
                customer_id: 'cus_456',
                plan_id: 'plan_789',
                period_end: 1640995200,
                ended_at: null
            };

            const subscription = subscriptionDao.parseRow(row);

            expect(subscription.id).toBe('sub_123');
            expect(subscription.customerId).toBe('cus_456');
            expect(subscription.periodEnd).toEqual(new Date(1640995200 * 1000));
        });
    });
});