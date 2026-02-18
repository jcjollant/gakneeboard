import { UsageType } from "./UsageType";

export class UsagePayload {
    data: string;
    type: UsageType;

    constructor(data: string, type: UsageType) {
        this.data = data;
        this.type = type;
    }
}
