
import { describe, expect, it } from '@jest/globals'
import { User } from '../backend/models/User';
import { Business } from '../backend/business/Business';
import { AccountType, PLAN_ID_SIM } from '@checklist/shared';

describe('New User Defaults', () => {
    it('should default to sim and have correct quotas', () => {
        const user = new User(1, 'some-hash');

        // Verify Account Type and Plan ID
        expect(user.accountType).toBe(AccountType.simmer);
        expect(user.planId).toBe(PLAN_ID_SIM);

        // Verify Quotas helper
        const quotas = Business.getQuotas(user);
        expect(quotas.prints).toBe(4);
        expect(quotas.pages).toBe(2);
        expect(quotas.templates).toBe(1);

        // Verify User properties (some are set in constructor, some rely on business logic later, 
        // but typically a new user might expect defaults effectively.
        // The constructor sets maxPages/maxTemplates to static Business constants which are Simmer defaults)
        expect(user.maxPages).toBe(2);
        expect(user.maxTemplates).toBe(1);

        // Note: constructor initializes printCredits to 0. Business.calculatePrintCredits handles the refill logic.
        // So checking user.printCredits might be 0, but Business.calculatePrintCredits(user) should be 4.
        const effectiveCredits = Business.calculatePrintCredits(user);
        expect(effectiveCredits).toBe(4);
    });
});
