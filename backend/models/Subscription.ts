export class Subscription {
    id:string;
    customerId:string;
    priceId:string;
    periodEnd:Date|undefined;
    endedAt:Date|undefined;
    private brandNew:boolean;

    constructor(id:string, customerId:string, planId:string, periodEnd:number=0, endedAt:number=0) {
        this.id = id;
        this.customerId = customerId;
        this.priceId = planId;
        this.periodEnd = periodEnd ? new Date( periodEnd * 1000) : undefined;
        this.setEnededAt(endedAt)
        this.brandNew = false;
    }

    isBrandNew():boolean {
        return this.brandNew;
    }

    setEnededAt(timestamp:number) {
        this.endedAt = timestamp ? new Date(timestamp * 1000) : undefined;
    }

    setBrandNew(value:boolean) {
        this.brandNew = true;
    }
}