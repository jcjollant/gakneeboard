import { AccountType } from "../models/AccountType";
import { PlanDescription } from "../models/PlanDescription";

export const bestValuePlan: string = 'ld2';
export const PLAN_ID_SIM: string = 'sim'
export const PLAN_ID_STUDENT_PILOT: string = 'pp1'
export const PLAN_ID_PRIVATE_PILOT: string = 'pp2'
export const PLAN_ID_BETA_DEAL: string = 'bd1'
export const PLAN_ID_LIFETIME_DEAL: string = 'ld2'

export const PRINT_CREDIT_SIMMER = 4;

export const PLANS: PlanDescription[] = [
    // Define plans here
    {
        id: PLAN_ID_SIM,
        displayName: 'Flight Simmer',
        subtitles: ['Just Testing', 'Get A Feel For The System'],
        active: true,
        show: true,
        displayPrice: 'Free',
        accountType: AccountType.simmer,
        chargeFrequency: 'never',
        priceEnvironmentVariable: undefined,
        quotas: {
            prints: PRINT_CREDIT_SIMMER,
            pages: 2,
            templates: 1
        },
        features: {
            advancedPrinting: false,
            export: false,
            restoreOldVersion: false
        }
    },
    {
        id: PLAN_ID_STUDENT_PILOT,
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
            pages: 8,
            templates: 2
        },
        features: {
            advancedPrinting: true,
            export: true,
            restoreOldVersion: false
        }
    },
    {
        id: PLAN_ID_PRIVATE_PILOT,
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
            export: true,
            restoreOldVersion: true
        },
        accountType: AccountType.private
    },
    {
        id: PLAN_ID_BETA_DEAL,
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
            export: true,
            restoreOldVersion: true
        },
        accountType: AccountType.beta
    },
    {
        id: 'ld1',
        displayName: 'Lifetime Deal',
        subtitles: ['Pay once, use forever', 'Grab it while it lasts!'],
        active: false,
        show: false,
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
            export: true,
            restoreOldVersion: true
        }
    },
    {
        id: PLAN_ID_LIFETIME_DEAL,
        displayName: 'Lifetime Deal',
        subtitles: ['Pay once, use forever', 'Grab it while it lasts!'],
        active: true,
        show: true,
        displayPrice: '$69',
        accountType: AccountType.lifetime,
        chargeFrequency: 'onetime',
        priceEnvironmentVariable: 'STRIPE_LD2_PRICE',
        quotas: {
            prints: 16,
            pages: 20,
            templates: 5
        },
        features: {
            advancedPrinting: true,
            export: true,
            restoreOldVersion: true
        }
    }
];
