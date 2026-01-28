export class Ticket {
    id: number;
    createTime: Date;
    severity: number;
    message: string;

    status: string;

    constructor(id: number, createTime: Date, severity: number, message: string, status: string = 'open') {
        this.id = id;
        this.createTime = createTime;
        this.severity = severity;
        this.message = message;
        this.status = status;
    }
}
