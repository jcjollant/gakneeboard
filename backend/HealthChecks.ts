import { sql } from  "@vercel/postgres";
import { Airport } from "./models/Airport";
import { GApi } from "./gapi"

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

    // figure out if the data is stale
    static async effectiveDateCheck():Promise<Check> {
        const dataCheck:Check = new Check('effectiveDate')
        const rentonCode:string = "KRNT"

        await Promise.all([GApi.getAirport(rentonCode),GApi.getAirportFromAdip(rentonCode)]).then((results) => {
            try {
                const rentonDb:Airport|undefined = results[0]
                const rentonAdip:Airport|undefined = results[1]

                if( !rentonDb || !rentonAdip) {
                    dataCheck.fail(rentonCode + " is not in the database")
                } else if( !rentonAdip) {
                    dataCheck.fail(rentonCode + " is not in ADIP")
                } else if( !('effectiveDate' in rentonDb)){
                    dataCheck.fail(rentonCode + " does not have effectiveDate in database")
                } else if( !('effectiveDate' in rentonAdip)){
                    dataCheck.fail(rentonCode + " does not have effectiveDate in ADIP")
                } else if(rentonDb.effectiveDate != rentonAdip.effectiveDate) {
                    dataCheck.fail("effective date mismatch db=" + rentonDb.effectiveDate + ", ADIP=" + rentonAdip.effectiveDate)
                } else {
                    console.log("effective date check match : " + rentonDb.effectiveDate)
                }
            } catch(e) {
                dataCheck.fail(JSON.stringify(e))
            }
        })
        return dataCheck    

    }

    public static async perform():Promise<Check[]> {
        return Promise.all([HealthCheck.effectiveDateCheck()]).then( async allChecks => {
            const failedChecks:number = allChecks.filter((check) => check.status === Check.FAIL).length
            const data:string = JSON.stringify(allChecks)

            console.log( '[HealthCheck.save]', data, 'failures', failedChecks)
            await sql`INSERT INTO health_checks (data,failures) VALUES (${data},${failedChecks})`;
    
            return allChecks
        })
    
    }
    
}
