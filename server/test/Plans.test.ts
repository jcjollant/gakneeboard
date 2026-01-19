import { describe, expect, it } from '@jest/globals';
import { PLANS, bestValuePlan } from '@checklist/shared';

describe('Plans', () => {
    it('bestValuePlan should exist in PLANS', () => {
        const plan = PLANS.find(p => p.id === bestValuePlan);
        expect(plan).toBeDefined();
        expect(plan?.id).toBe(bestValuePlan);
    });
});
