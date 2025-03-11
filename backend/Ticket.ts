export class Ticket {
    static create(sev:number, message:string) {
        console.error('[Ticket][' + sev + ']', message)
    }
}
