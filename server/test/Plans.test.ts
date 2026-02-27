import { describe, expect, it } from '@jest/globals';
import { PLANS, bestValuePlan } from '@gak/shared';
import { PlanService } from '../backend/services/PlanService';

describe('Plans', () => {
    it('bestValuePlan should exist in PLANS and have isBestValue set', () => {
        const plan = PLANS.find(p => p.id === bestValuePlan);
        expect(plan).toBeDefined();
        expect(plan?.id).toBe(bestValuePlan);
        expect(plan?.isBestValue).toBe(true);
    });
    it('exactly one plan should be marked as best value', () => {
        const bestValuePlans = PLANS.filter(p => p.isBestValue);
        expect(bestValuePlans.length).toBe(1);
    });
    it('should know all plans', () => {
        const plans = ['sim', 'pp1', 'pp3', 'ld1', 'ld2', 'bd1', 'cr1'];
        plans.forEach(planId => {
            const plan = PlanService.getPlan(planId);
            expect(plan).toBeDefined();
        });
    });
});
