import { UsageCount } from "./UsageCount";
import { User } from "./User";

export class UserProfile {
    id: number
    email: string;
    name: string;
    accountType: string;
    eula: number;
    templateCount: number;
    pageCount: number;

    usage: UsageCount[]
    create_time: Date | undefined;
    planId: string | undefined;

    constructor(user: User, usage: UsageCount[], templateCount: number, pageCount: number) {
        this.id = user.id
        this.email = user.email
        this.name = user.name
        this.accountType = user.accountType
        this.eula = user.eula
        this.templateCount = templateCount
        this.pageCount = pageCount
        this.create_time = user.createDate;
        this.planId = user.planId;

        this.usage = usage
    }
}