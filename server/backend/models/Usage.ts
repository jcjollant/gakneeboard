import { UsageType } from "@gak/shared";

export class Usage {
    user_id: number;
    data: string;
    type: UsageType;

    constructor(user_id: number, data: string, type: UsageType) {
        this.user_id = user_id
        this.data = data
        this.type = type
    }
}