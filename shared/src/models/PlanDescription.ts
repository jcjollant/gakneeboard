import { AccountType } from "./AccountType";

export interface PlanDescription {
    id: string;
    displayName: string; // Display name of the plan in the UI
    active: boolean; // Whether this plan is active
    show: boolean; // Whether to show this plan in the UI
    displayPrice: string;
    accountType: AccountType;
    chargeFrequency: 'monthly' | 'yearly' | 'onetime' | 'never';
    priceEnvironmentVariable?: string; // Environment variable name
    features: {
        printsPerMonth: number;
        advancedPrinting: boolean;
        maxKneeboards: number;
        maxPages: number;
        restoreOldVersion: boolean;
    }
}