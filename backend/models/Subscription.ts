export class Subscription {
    id:string;
    customerId:string;
    planId:string|undefined;
    userId:number|undefined;

    constructor(id:string, customerId:string, planId:string|undefined=undefined, userId:number|undefined=undefined) {
        this.id = id;
        this.customerId = customerId;
        this.planId = planId;
        this.userId = userId;
    }
}