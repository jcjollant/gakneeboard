export class Ticket {
    id: number;
    createTime: Date;
    severity: number;
    message: string;

    constructor(id: number, createTime: Date, severity: number, message: string) {
        this.id = id;
        this.createTime = createTime;
        this.severity = severity;
        this.message = message;
    }
}
