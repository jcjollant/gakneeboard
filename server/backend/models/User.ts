import { createHash } from 'crypto'
import { AccountType, PLAN_ID_SIM } from '@checklist/shared';
import { Business } from '../business/Business';
import { AttributionData } from './AttributionData';

export class User {
    id: number;
    sha256: string;
    name: string;
    source: string;
    email: string;
    maxPages: number;
    maxTemplates: number;
    accountType: AccountType;
    customerId: string | undefined;
    printCredits: number
    createDate: Date | undefined;
    eula: number;
    attribution?: AttributionData;
    planId: string | undefined;
    homeAirport: string | undefined;

    constructor(id: number, sha256: string) {
        this.id = id;
        this.sha256 = sha256;
        this.name = '';
        this.source = '';
        this.email = '';
        this.maxPages = 0;
        this.maxTemplates = 0;
        this.accountType = AccountType.unknown;
        this.customerId = undefined;
        this.printCredits = 0;
        this.createDate = undefined;
        this.eula = 0;
        this.planId = undefined;
        this.homeAirport = undefined;
    }


    // public getSha256():string {
    //     return this.sha256
    // }

    public static createSha256(input: any): string {
        return createHash('sha256').update(JSON.stringify(input)).digest('hex')
    }

    public setEmail(email: string) {
        this.email = email;
    }

    public setSource(source: string) {
        this.source = source;
    }

    public setMaxPages(newMax: number) {
        this.maxPages = newMax;
    }

    public setMaxTemplates(newMax: number) {
        this.maxTemplates = newMax;
    }

    public setName(newName: string) {
        this.name = newName;
    }

    public setAccountType(newType: AccountType) {
        this.accountType = newType;
    }

    public setCustomerId(customer_id: string) {
        this.customerId = customer_id;
    }

    public setPrintCredits(count: number) {
        this.printCredits = count;
    }

    public setCreateDate(date: Date | undefined) {
        this.createDate = date;
    }

    public setEula(eula: number) {
        this.eula = eula;
    }


    public setAttribution(attribution: AttributionData) {
        this.attribution = attribution;
    }

    public setPlanId(planId: string) {
        this.planId = planId;
    }

    public setHomeAirport(airport: string) {
        this.homeAirport = airport;
    }
}