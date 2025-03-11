export class Refill {
    userId:number;
    previousCount:number;
    newCount:number; 

    constructor(userId:number, previousCount:number, newCount:number) {
        this.userId = userId;
        this.previousCount = previousCount;
        this.newCount = newCount;
    }
}