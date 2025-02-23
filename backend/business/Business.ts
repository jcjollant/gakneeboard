import { AccountType } from "../models/AccountType";

export class Business {
    static maxPagesFromAccountType(accountType:AccountType):number {
        switch(accountType) {
            case AccountType.instrument: 
                return 50;
            case AccountType.private: 
                return 20;
            case AccountType.beta: 
                return 5;
            case AccountType.simmer:
            default:
                return 0;
        }
    }
}