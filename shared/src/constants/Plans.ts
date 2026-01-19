import { AccountType } from "../models/AccountType";
import { PlanDescription } from "../models/PlanDescription";

export const PLANS: PlanDescription[] = [
    // Define plans here
    {
        id: 'simmer',
        displayName: 'Simmer',
        active: true,
        show: false,
        displayPrice: 'Free',
        accountType: AccountType.simmer,
        chargeFrequency: 'never',
        priceEnvironmentVariable: undefined,
        features: {
            printsPerMonth: 4,
            maxPages: 2,
            maxKneeboards: 1,
            advancedPrinting: false,
            restoreOldVersion: false
        }
    },
    {
        id: 'student',
        displayName: 'Student',
        active: true,
        show: true,
        displayPrice: '$2.99',
        accountType: AccountType.student,
        chargeFrequency: 'monthly',
        priceEnvironmentVariable: 'STUDENT_PRICE',
        features: {
            printsPerMonth: 8,
            maxPages: 4,
            maxKneeboards: 2,
            advancedPrinting: true,
            restoreOldVersion: false
        }
    },
    {
        id: 'private',
        displayName: 'Private',
        active: true,
        show: true,
        displayPrice: '$4.49',
        accountType: AccountType.private,
        chargeFrequency: 'yearly',
        priceEnvironmentVariable: 'PRIVATE_PRICE',
        features: {
            printsPerMonth: 16,
            maxKneeboards: 5,
            maxPages: 20,
            advancedPrinting: true,
            restoreOldVersion: true
        }
    },
    {
        id: 'lifetime',
        displayName: 'Lifetime',
        active: true,
        show: true,
        displayPrice: '$59',
        accountType: AccountType.lifetime,
        chargeFrequency: 'onetime',
        priceEnvironmentVariable: 'LIFETIME_PRICE',
        features: {
            printsPerMonth: 16,
            maxKneeboards: 5,
            maxPages: 20,
            advancedPrinting: true,
            restoreOldVersion: true
        }
    }
];
