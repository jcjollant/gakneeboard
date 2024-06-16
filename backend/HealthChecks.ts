import { sql } from  "@vercel/postgres";

export class Check {
    name:string;
    status:string;
    reason:string;

    constructor(checkName:string) {
        this.name = checkName
        this.status = 'success'
        this.reason = ''
    }

    fail(msg:string) {
        this.status = 'fail'
        this.reason = msg;
    }
}

export class HealthCheck {
    public static async save(checks:Check[]) {
        // console.log( '[db.saveChecks] ' + data)
        const data:string = JSON.stringify(checks)
        await sql`INSERT INTO health_checks (data) VALUES (${data})`;
    }
    
    
}
