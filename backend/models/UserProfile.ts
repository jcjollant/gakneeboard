import { UsageCount } from "./UsageCount";
import { User } from "./User";

export class UserProfile {
    id:number
    email:string;
    name:string;
    accountType:string;
    eula:number;

    usage:UsageCount[]
    constructor(user:User, usage:UsageCount[]) {
        this.id = user.id
        this.email = user.email
        this.name = user.name
        this.accountType = user.accountType
        this.eula = user.eula

        this.usage = usage
    }
}