export class UsageCount {
    usage_type:string;
    count:number;
    constructor(usage_type:string, count:number) {
        this.usage_type = usage_type
        this.count = count
    }
}