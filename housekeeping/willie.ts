
import { Airport } from '../backend/models/Airport'
import { GApi } from '../backend/gapi'
import { postgresUrl } from '../test/constants'
import { Check, HealthCheck } from '../backend/HealthChecks'

console.log('!Argh!')
process.env.POSTGRES_URL=postgresUrl


// figure out if the data is stale
const effectiveDateCheck = async function ():Promise<Check> {
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

async function main() {
    await Promise.all([effectiveDateCheck()]).then( async allChecks => {
        await HealthCheck.save(allChecks)    
    })
}

main().then(() => {
    console.log('!Aye!')
})