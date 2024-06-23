import { sql } from  "@vercel/postgres";
import { Airport } from "./models/Airport";
import { GApi } from "./GApi"
import { UserDao } from "./UserDao"
import { FeedbackDao } from "./FeedbackDao"
import { AirportDao } from "./AirportDao";

export class Check {
    name:string;
    status:string;
    msg:string;
    public static FAIL:string = 'fail'
    public static SUCCESS:string = 'success'

    constructor(checkName:string) {
        this.name = checkName
        this.status = Check.SUCCESS
        this.msg = ''
    }

    fail(msg:string) {
        this.status = Check.FAIL
        this.msg = msg;
    }
}

export class HealthCheck {

    static async airportDuplicatesCheck():Promise<Check> {
        const check:Check = new Check('airportDuplicates')
        await AirportDao.countDuplicates().then( (count:number) => {
            if( count > 0) {
                check.fail("Found " + count + " duplicates")
            } else {
                check.msg = "No duplicates found"
            }
        })
        return check
    }

    // figure out if the data is stale
    static async effectiveDateCheck():Promise<Check> {
        const dataCheck:Check = new Check('effectiveDate')
        const rentonCode:string = "KRNT"

        await Promise.all([GApi.getAirport(rentonCode),GApi.getAirportFromAdip(rentonCode,false)]).then((results) => {
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
                    // console.log("effective date check match : " + rentonDb.effectiveDate)
                }
            } catch(e) {
                dataCheck.fail(JSON.stringify(e))
            }
        })
        return dataCheck    

    }

    static async feedbackCheck():Promise<Check> {
        const feedbackCheck:Check = new Check('feedback')
        const feedbackCount:number = await FeedbackDao.count()
        feedbackCheck.msg = "We have " + feedbackCount + " feedbacks"
        return feedbackCheck
    }

    static async usersCheck():Promise<Check> {
        const userCheck:Check = new Check('users')
        const userCount:number = await UserDao.count()
        userCheck.msg = "We have " + userCount + " users"
        return userCheck
    }

    public static async perform():Promise<Check[]> {
        return Promise.all([
                HealthCheck.effectiveDateCheck(), 
                HealthCheck.usersCheck(),
                HealthCheck.feedbackCheck(),
                HealthCheck.airportDuplicatesCheck()
            ]).then( async allChecks => {
            const failedChecks:number = allChecks.filter((check) => check.status === Check.FAIL).length
            const data:string = JSON.stringify(allChecks)

            // console.log( '[HealthCheck.save]', data, 'failures', failedChecks)
            await sql`INSERT INTO health_checks (data,failures) VALUES (${data},${failedChecks})`;
    
            return allChecks
        })
    
    }
    
}
