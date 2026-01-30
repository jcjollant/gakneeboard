import { AccountType } from './AccountType';
// import { TemplateView } from './TemplateView'; // TemplateView is not in shared?

export interface UserView {
    sha256: string;
    name: string;
    maxPages: number; // max pages across all templates
    maxTemp: number; // max templates
    templates: any[];
    accountType: AccountType;
    printCredits: number;
    eulaCurrent: boolean;
    homeAirport?: string;
}
