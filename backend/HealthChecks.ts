import { sql } from  "@vercel/postgres";
import { Airport } from "./models/Airport";
import { Adip } from './adip/Adip'
import { AirportDao } from "./AirportDao";
import { Email, EmailType } from './Email'
import { PublicationDao } from './PublicationDao'


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

    pass(msg:string) {
        this.status = Check.SUCCESS
        this.msg = msg
    }
}

export class HealthCheck {

    static async airportDuplicatesCheck():Promise<Check> {
        const check:Check = new Check('airportDuplicates')
        await AirportDao.countDuplicates().then( (count:number) => {
            if( count > 0) {
                check.fail("Found " + count + " duplicates")
            } else {
                check.pass( "No duplicates found")
            }
        })
        return check
    }

    // figure out if the data is stale
    static async effectiveDateCheck():Promise<Check> {
        const check:Check = new Check('effectiveDate')
        const rentonCode:string = "KRNT"

        await Promise.all([AirportDao.readList( [rentonCode]),Adip.fetchAirport(rentonCode,false)]).then((results) => {
            try {
                const rentonDb:Airport = results[0][0][1]
                const rentonAdip:Airport|undefined = results[1]

                if( !rentonDb) {
                    check.fail(rentonCode + " is not in the database")
                } else if( !rentonAdip) {
                    check.fail(rentonCode + " is not in ADIP")
                } else if( !('effectiveDate' in rentonDb)){
                    check.fail(rentonCode + " does not have effectiveDate in database")
                } else if( !('effectiveDate' in rentonAdip)){
                    check.fail(rentonCode + " does not have effectiveDate in ADIP")
                } else if(rentonDb.effectiveDate != rentonAdip.effectiveDate) {
                    check.fail("effective date mismatch db=" + rentonDb.effectiveDate + ", ADIP=" + rentonAdip.effectiveDate)
                } else {
                    check.pass("effective date check match : " + rentonDb.effectiveDate)
                    // console.log("effective date check match : " + rentonDb.effectiveDate)
                }
            } catch(e) {
                check.fail(JSON.stringify(e))
            }
        })
        return check    

    }

    // static async feedbackCheck():Promise<Check> {
    //     const check:Check = new Check('feedback')
    //     const feedbackCount:number = await FeedbackDao.count()
    //     check.pass( "We have " + feedbackCount + " feedbacks")
    //     return check
    // }

    static async availablePublicationsCheck():Promise<Check> {
        const check:Check = new Check('publications')
        const availableCount:number = await PublicationDao.countAvailable()
        if( availableCount < 600) {
            check.fail("Only " + availableCount + " publications available")
        } else {
            check.pass( "We have " + (1296-availableCount) + "/ 1296 publications")
        }
        return check
    }

    /**
     * Sends an email with the outcome of all checks
     * This methods requires a password that seems to expire ona regular bas
     * @param data 
     * @param failedChecks 
     * @returns 
     */
    static async sendMail(data:any, failedChecks:number) {
        const message = 'Found ' + failedChecks + ' fail(s)\n\n' + data;
        await Email.send(message, EmailType.Housekeeping)
    }

    public static async perform():Promise<Check[]> {
        return Promise.all([
                HealthCheck.effectiveDateCheck(), 
                // HealthCheck.usersCheck(),
                // HealthCheck.feedbackCheck(),
                // HealthCheck.sheetsCheck(),
                HealthCheck.airportDuplicatesCheck(),
                HealthCheck.availablePublicationsCheck()
            ]).then( async allChecks => {
            const failedChecks:number = allChecks.filter((check) => check.status === Check.FAIL).length
            const data:string = JSON.stringify(allChecks)

            console.log( '[HealthCheck.perform]', data, 'failures', failedChecks)
            await sql`INSERT INTO health_checks (data,failures) VALUES (${data},${failedChecks})`;
    
            console.log( '[HealthCheck.perform] sending email')
            await HealthCheck.sendMail( data, failedChecks)
            return allChecks
        })
    
    }
    
}
