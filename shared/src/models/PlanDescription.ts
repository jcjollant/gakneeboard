import { AccountType } from "./AccountType";
import { Quotas } from "./Quotas";

export interface PlanDescription {
    id: string;
    displayName: string; // Display name of the plan in the UI
    active: boolean; // Whether this plan is active
    show: boolean; // Whether to show this plan in the UI
    displayPrice: string;
    subtitles?: string[];
    accountType: AccountType;
    chargeFrequency: 'monthly' | 'yearly' | 'onetime' | 'never';
    priceEnvironmentVariable?: string; // Environment variable name
    quotas: Quotas;
    features: {
        advancedPrinting: boolean;
        export: boolean;
        restoreOldVersion: boolean;
    }
}