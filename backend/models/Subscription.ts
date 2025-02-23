export class Subscription {
    id:string;
    customerId:string;
    planId:string;
    periodEnd:Date|undefined;
    endedAt:Date|undefined;

    constructor(id:string, customerId:string, planId:string, periodEnd:number=0, endedAt:number=0) {
        this.id = id;
        this.customerId = customerId;
        this.planId = planId;
        this.periodEnd = periodEnd ? new Date( periodEnd * 1000) : undefined;
        this.setEnededAt(endedAt)
    }

    setEnededAt(timestamp:number) {
        this.endedAt = timestamp ? new Date(timestamp * 1000) : undefined;
    }

}