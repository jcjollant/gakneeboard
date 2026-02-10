import { describe, expect, it } from '@jest/globals';
import { PLANS, bestValuePlan } from '@gak/shared';
import { PlanService } from '../backend/services/PlanService';

describe('Plans', () => {
    it('bestValuePlan should exist in PLANS', () => {
        const plan = PLANS.find(p => p.id === bestValuePlan);
        expect(plan).toBeDefined();
        expect(plan?.id).toBe(bestValuePlan);
    });
    // the following lis tof plans should be known 'sim', 'pp1', 'pp2', 'ld1', 'ld2', 'bd1'
    it('should know all plans', () => {
        const plans = ['sim', 'pp1', 'pp2', 'ld1', 'ld2', 'bd1'];
        plans.forEach(planId => {
            const plan = PlanService.getPlan(planId);
            expect(plan).toBeDefined();
        });
    });
});
