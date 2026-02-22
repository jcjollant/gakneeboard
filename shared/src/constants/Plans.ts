import { AccountType } from "../models/AccountType";
import { PlanDescription } from "../models/PlanDescription";

export const PLAN_ID_SIM: string = 'sim'
export const PLAN_ID_STUDENT_PILOT: string = 'pp1'
export const PLAN_ID_PRIVATE_PILOT: string = 'pp3'
export const PLAN_ID_CHECKRIDE_READY: string = 'cr1'
export const bestValuePlan: string = PLAN_ID_PRIVATE_PILOT;
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
        show: false,
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
            metars: false,
            notams: false,
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
        priceEnvironmentVariable: 'STRIPE_PRICE_SP1',
        quotas: {
            prints: 8,
            pages: 8,
            templates: 2
        },
        features: {
            advancedPrinting: true,
            export: false,
            metars: true,
            notams: false,
            restoreOldVersion: false
        }
    },
    {
        id: PLAN_ID_CHECKRIDE_READY,
        displayName: 'Checkride Ready',
        subtitles: ['Perfect for Final Prep', 'More pages when you need them'],
        active: true,
        show: true,
        displayPrice: '$4.99',
        accountType: AccountType.checkride,
        chargeFrequency: 'monthly',
        priceEnvironmentVariable: 'STRIPE_PRICE_CR1',
        quotas: {
            prints: 24,
            pages: 20,
            templates: 5
        },
        features: {
            advancedPrinting: true,
            export: true,
            metars: true,
            notams: true,
            restoreOldVersion: true
        }
    },
    {
        id: PLAN_ID_PRIVATE_PILOT,
        displayName: 'Private Pilot',
        active: true,
        show: true,
        displayPrice: '$49.99',
        subtitles: ['No Brainer', 'Unlimited Features and Prints'],
        chargeFrequency: 'yearly',
        priceEnvironmentVariable: 'STRIPE_PRICE_PP3',
        quotas: {
            prints: -1,
            pages: -1,
            templates: -1
        },
        features: {
            advancedPrinting: true,
            export: true,
            metars: true,
            notams: true,
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
        priceEnvironmentVariable: 'STRIPE_PRICE_BD1',
        quotas: {
            prints: -1,
            pages: 50,
            templates: 10
        },
        features: {
            advancedPrinting: true,
            export: true,
            metars: true,
            notams: true,
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
        priceEnvironmentVariable: 'STRIPE_PRICE_LD1',
        quotas: {
            prints: 16,
            pages: 20,
            templates: 5
        },
        features: {
            advancedPrinting: true,
            export: true,
            metars: true,
            notams: true,
            restoreOldVersion: true
        }
    },
    {
        id: PLAN_ID_LIFETIME_DEAL,
        displayName: 'Lifetime Deal',
        subtitles: ['Pay once, use forever', 'Grab it while it lasts!'],
        active: true,
        show: false,
        displayPrice: '$69',
        accountType: AccountType.lifetime,
        chargeFrequency: 'onetime',
        priceEnvironmentVariable: 'STRIPE_PRICE_LD2',
        quotas: {
            prints: 16,
            pages: 20,
            templates: 5
        },
        features: {
            advancedPrinting: true,
            export: true,
            metars: true,
            notams: true,
            restoreOldVersion: true
        }
    }
];
