import { AccountType } from "../models/AccountType";
import { PlanDescription } from "../models/PlanDescription";

export const bestValuePlan: string = 'ld1';

export const PLANS: PlanDescription[] = [
    // Define plans here
    {
        id: 'sim',
        displayName: 'Flight Simmer',
        subtitles: ['Just Testing', 'Get A Feel For The System'],
        active: true,
        show: true,
        displayPrice: 'Free',
        accountType: AccountType.simmer,
        chargeFrequency: 'never',
        priceEnvironmentVariable: undefined,
        quotas: {
            prints: 4,
            pages: 2,
            templates: 1
        },
        features: {
            advancedPrinting: false,
            restoreOldVersion: false
        }
    },
    {
        id: 'pp1', // old private pilot
        displayName: 'Student Pilot',
        subtitles: ['No Commitment', 'Best for Occasional Use'],
        active: true,
        show: true,
        displayPrice: '$2.99',
        accountType: AccountType.student,
        chargeFrequency: 'monthly',
        priceEnvironmentVariable: 'STRIPE_PP1_PRICE',
        quotas: {
            prints: 8,
            pages: 4,
            templates: 2
        },
        features: {
            advancedPrinting: true,
            restoreOldVersion: false
        }
    },
    {
        id: 'pp2',
        displayName: 'Private Pilot',
        active: true,
        show: false,
        displayPrice: '$4.49',
        subtitles: ['Charged $53.88/year', 'This is our regular price'],
        chargeFrequency: 'yearly',
        priceEnvironmentVariable: 'STRIPE_PP2_PRICE',
        quotas: {
            prints: 16,
            pages: 20,
            templates: 5
        },
        features: {
            advancedPrinting: true,
            restoreOldVersion: true
        },
        accountType: AccountType.private
    },
    {
        id: 'bd1',
        displayName: 'Beta Deal',
        active: false,
        show: false,
        displayPrice: '$4.49',
        subtitles: ['Charged $53.88/year', 'This is our regular price'],
        chargeFrequency: 'yearly',
        priceEnvironmentVariable: 'STRIPE_BD1_PRICE',
        quotas: {
            prints: -1,
            pages: 50,
            templates: 10
        },
        features: {
            advancedPrinting: true,
            restoreOldVersion: true
        },
        accountType: AccountType.beta
    },
    {
        id: 'ld1',
        displayName: 'Lifetime Deal',
        subtitles: ['Pay once, use forever', 'Grab it while it lasts!'],
        active: true,
        show: true,
        displayPrice: '$59',
        accountType: AccountType.lifetime,
        chargeFrequency: 'onetime',
        priceEnvironmentVariable: 'STRIPE_LD1_PRICE',
        quotas: {
            prints: 16,
            pages: 20,
            templates: 5
        },
        features: {
            advancedPrinting: true,
            restoreOldVersion: true
        }
    }
];
