
import { describe, expect, it } from '@jest/globals'
import { User } from '../backend/models/User';
import { Business } from '../backend/business/Business';
import { AccountType, PLAN_ID_SIM } from '@gak/shared';

describe('New User Defaults', () => {
    it('should initialize empty and then be primed to sim', () => {
        const user = new User(1, 'some-hash');

        // Verify Initial State (Unknown/Empty)
        expect(user.accountType).toBe(AccountType.unknown);
        expect(user.planId).toBeUndefined();
        expect(user.maxPages).toBe(0);
        expect(user.maxTemplates).toBe(0);
        expect(user.printCredits).toBe(0);

        // Prime the user
        Business.primeUser(user);

        // Verify Primed State (Simmer defaults)
        expect(user.accountType).toBe(AccountType.simmer);
        expect(user.planId).toBe(PLAN_ID_SIM);

        // Verify Quotas helper
        const quotas = Business.getQuotas(user);
        expect(quotas.prints).toBe(4);
        expect(quotas.pages).toBe(2);
        expect(quotas.templates).toBe(1);

        // Verify User properties set by primeUser
        expect(user.maxPages).toBe(2);
        expect(user.maxTemplates).toBe(1);
        expect(user.printCredits).toBe(4);

        // Double check business calculation
        const effectiveCredits = Business.calculatePrintCredits(user);
        expect(effectiveCredits).toBe(4);
    });
});
