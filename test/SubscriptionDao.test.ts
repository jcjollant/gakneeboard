
import { describe, expect, it} from '@jest/globals';
import { SubscriptionDao } from '../backend/dao/SubscriptionDao.ts';

require('dotenv').config();

describe('SubscriptionDao', () => {

    it('can update', async () => {
        const dao = new SubscriptionDao();
        const now = new Date().getMilliseconds();
        const subscription = await dao.update('sub-id','customer-id', 'price-id', now, null, null)
    })

    it('can parseRow', async () => {
        const subId = 34;
        const someCustomerId = 'cus_SomeCustomerId'
        const somePlanId = 'plan_SomePalInd'
        const now = new Date()

        const row = {
            id: subId,
            customer_id: someCustomerId,
            plan_id: somePlanId,
            period_end: now.getTime() / 1000,
            ended_at: null
        }
        const subscription = new SubscriptionDao().parseRow(row)
        expect(subscription.id).toBe(subId);
        expect(subscription.customerId).toBe(someCustomerId);
        expect(subscription.priceId).toBe(somePlanId);
        expect(subscription.periodEnd?.getTime()).toBe(now.getTime());
        expect(subscription.endedAt).toBeUndefined();
    })
});

