import { sql } from '@vercel/postgres'
import { GApi } from "../backend/GApi"
import { Adip } from "../backend/Adip"
import { postgresUrl } from "../test/constants"
import { Airport } from "../backend/models/Airport"
import { AirportDao } from '../backend/AirportDao'
import { Metrics } from '../backend/Metrics'
// import { HouseKeeping } from '../backend/HouseKeepings'

process.env.POSTGRES_URL=postgresUrl

async function checkEffectiveDates() {
    const result = await sql`SELECT data,id FROM Airports WHERE creatorId IS NULL`
    const effectiveDates:any = {}
    for(const row of result.rows) {
        const data = JSON.parse(row['data']);
        if( 'effectiveDate' in data) {
            if( data.effectiveDate in effectiveDates) {
                effectiveDates[data.effectiveDate]++
            } else {
                effectiveDates[data.effectiveDate] = 1
            }
        } else {
            console.log( "No effective date for " + row['id'])
        }
    }
    console.log( JSON.stringify(effectiveDates))
}

async function refreshAirport(code:string,id:number) {
    console.log( "refreshing " + code + ' at id ' + id)
    const airport:Airport|undefined = await Adip.fetchAirport(code);
    if(airport) { // adip saves the day, persist this airport in postrgres
        console.log( "[gapi] found " + code + ' in ADIP');
        // console.log( '[gapi] ' + JSON.stringify(airport));
        await AirportDao.updateAirport(id,airport);
        console.log( 'upgraded ' + code + ' at id ' + id)
    } else {
        console.log( "Upgrade failed for " + code);
    }

}

async function refreshAllAirports() {
    const result = await sql`SELECT Code,Id FROM Airports WHERE creatorId IS NULL`

    console.log( "Matching airports " + result.rowCount)

    while( result.rows.length > 0) {
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 1000));
        const row = result.rows.pop()
        refreshAirport(row?.code, row?.id)
    }
}

async function upgradeVersion() {
    const minVersion = Airport.currentVersion;
    // const result = await sql`SELECT Code,Id FROM Airports WHERE version < ${minVersion} LIMIT 10`
    const result = await sql`SELECT Code,Id FROM Airports WHERE version < ${minVersion}`

    console.log( "Matching airports " + result.rowCount)

    while( result.rows.length > 0) {
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 1000));
        const row = result.rows.pop()
        refreshAirport(row?.code, row?.id)
    }

    // result.rows.forEach( async (row) => {
    //     // wait random time between 1 and 3 seconds
    //     await new Promise(r => setTimeout(r, Math.random() * 3000 + 2000));
    //     refreshAirport(row.code, row.id)
    // })
}

async function findMilitaryFrequencies() {
    const result = await sql`SELECT * FROM Airports`
    const candidate = result.rows.filter( row => {
        const airport = JSON.parse(row.data);
        let gndIsMilitary = GApi.isMilitary( airport.gnd)
        let weatherIsMilitary = GApi.isMilitary( airport.weather.freq)
        const isMilitary = gndIsMilitary || weatherIsMilitary
        if( isMilitary) {
            console.log( "Military " + row.code + " gnd " + gndIsMilitary + " weather " + weatherIsMilitary)
        }
        return  isMilitary
    })
    
    candidate.forEach( async row => {
        console.log( "Found military " + row.code)
        await refreshAirport(row.code, row.id)
    })
    console.log( "Total military " + candidate.length)
}

async function distilUnknowns() {
    const result = await sql`SELECT * FROM unknowns LIMIT 30 WHERE code <> "ORD"`
    const codes = result.rows.map( row => row.code)

    console.log( '[distilUnknowns] considering', JSON.stringify(codes))

    while( codes.length > 0) {
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 1000));
        const code = codes.pop()
        console.log('[distilUnknowns] processing', code)
        await GApi.getAirportList([code]);
        await sql`DELETE FROM unknowns WHERE Code = ${code}`
    }

}

async function createPublicationCodes() {
    // create a list all possible 2 alphanumeric character codes
    const codes:string[] = Array.from({length: 36*36}, (_, i) => i.toString(36).toUpperCase().padStart(2, '0'))
    // randomize the list
    codes.sort( () => Math.random() - 0.5)
    // const list = code.join
    // sql`INSERT INTO publicationCodes (code) VALUES ${JSON.stringify(codes)}`
    // console.log( JSON.stringify(codes))
    // insert every code from codes in the database
    for( const code of codes) {
        await sql`INSERT INTO publications (code) VALUES (${code})`
        console.log( "Inserted " + code)
    }

}

// const output = []
// result.rows.forEach( row => {
//     // console.log( "found on DB entry " + JSON.stringify(row))
//     const airport = JSON.parse(row.data);
//     output.push(airport)
// })

// return output

// upgradeVersion()
// refreshAllAirports()
// refreshAirport("KRNT",48)

// findMilitaryFrequencies()
// checkEffectiveDates()
// distilUnknowns()
// createPublicationCodes()

// Metrics.perform(false, false).then(dataString => {
//     console.log( dataString)
// })


Metrics.sessions().then(metric => {
    console.log(metric.name, metric.value)
})