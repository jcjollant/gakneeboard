export class Housekeeping {
    id: number;
    create_time: Date;
    data: any;
    failed: number;
    passed: number;
    skipped: number;

    constructor(id: number, create_time: Date, data: any, failed: number, passed: number, skipped: number) {
        this.id = id;
        this.create_time = create_time;
        this.data = data;
        this.failed = failed;
        this.passed = passed;
        this.skipped = skipped;
    }
}
