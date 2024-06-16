import { sql } from  "@vercel/postgres";
import { fail } from "assert";

export class Check {
    name:string;
    status:string;
    reason:string;
    public static FAIL:string = 'fail'
    public static SUCCESS:string = 'success'

    constructor(checkName:string) {
        this.name = checkName
        this.status = Check.SUCCESS
        this.reason = ''
    }

    fail(msg:string) {
        this.status = Check.FAIL
        this.reason = msg;
    }
}

export class HealthCheck {
    public static async save(checks:Check[],failures:number) {
        const data:string = JSON.stringify(checks)
        console.log( '[HealthCheck.save]', data, 'failures', failures)
        await sql`INSERT INTO health_checks (data,failures) VALUES (${data},${failures})`;
    }
    
    
}
