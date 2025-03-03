import { createHash } from 'crypto'
import { AccountType } from './AccountType';

export class User {
    id:number;
    sha256:string;
    name:string;
    source:string;
    email:string;
    maxTemplates:number;
    accountType:AccountType;
    customerId:string|undefined;
    printCredits:number

    public static defaultMaxTemplates:number = 5;

    constructor( id:number, sha256:string) {
        this.id = id;
        this.sha256 = sha256;
        this.name = '';
        this.source = '';
        this.email = '';
        this.maxTemplates = User.defaultMaxTemplates;
        this.accountType = AccountType.simmer;
        this.customerId = undefined;
        this.printCredits = 0;
    }


    // public getSha256():string {
    //     return this.sha256
    // }

    public static createSha256(input: any):string {
        return createHash('sha256').update(JSON.stringify(input)).digest('hex')
    }
 
    public setEmail(email:string) {
        this.email = email;
    }

    public setSource(source:string) {
        this.source = source;
    }

    public setMaxTemplates( newMax:number) {
        this.maxTemplates = newMax;
    }

    public setName( newName:string) {
        this.name = newName;
    }    

    public setAccountType( newType:AccountType) {
        this.accountType = newType;
    }
    
    public setCustomerId(customer_id: string) {
        this.customerId = customer_id;
    }

    public setPrintCredits(count:number) {
        this.printCredits  = count;
    }

}