// force pull the data for all airports that have an old version


const postgres = require('@vercel/postgres')
import { GApi } from "../backend/gapi"
import adip from '../backend/adip'
import db from '../backend/db'
import { postgresUrl } from "../test/constants"

process.env.POSTGRES_URL=postgresUrl

async function checkEffectiveDates() {
    const result = await postgres.sql`SELECT data,id FROM Airports WHERE creatorId IS NULL`
    const effectiveDates = {}
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

async function refreshAirport(code,id) {
    console.log( "refreshing " + code + ' at id ' + id)
    const airport = await adip.fetchAirport(code);
    if(airport) { // adip saves the day, persist this airport in postrgres
        console.log( "[gapi] found " + code + ' in ADIP');
        // console.log( '[gapi] ' + JSON.stringify(airport));
        await db.updateAirport(id,airport,adip.modelVersion);
        console.log( 'upgraded ' + code + ' at id ' + id)
    } else {
        console.log( "Upgrade failed for " + code);
    }

}

async function refreshAllAirports() {
    const result = await postgres.sql`SELECT Code,Id FROM Airports WHERE creatorId IS NULL`

    console.log( "Matching airports " + result.rowCount)

    while( result.rows.length > 0) {
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 1000));
        const row = result.rows.pop()
        refreshAirport(row.code, row.id)
    }
}

async function upgradeVersion() {
    const minVersion = adip.modelVersion;
    // const result = await postgres.sql`SELECT Code,Id FROM Airports WHERE version < ${minVersion} LIMIT 10`
    const result = await postgres.sql`SELECT Code,Id FROM Airports WHERE version < ${minVersion}`

    console.log( "Matching airports " + result.rowCount)

    while( result.rows.length > 0) {
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 1000));
        const row = result.rows.pop()
        refreshAirport(row.code, row.id)
    }

    // result.rows.forEach( async (row) => {
    //     // wait random time between 1 and 3 seconds
    //     await new Promise(r => setTimeout(r, Math.random() * 3000 + 2000));
    //     refreshAirport(row.code, row.id)
    // })
}

async function findMilitaryFrequencies() {
    const result = await postgres.sql`SELECT * FROM Airports`
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


// const output = []
// result.rows.forEach( row => {
//     // console.log( "found on DB entry " + JSON.stringify(row))
//     const airport = JSON.parse(row.data);
//     output.push(airport)
// })

// return output

// upgradeVersion()
// refreshAllAirports()
// findMilitaryFrequencies()
checkEffectiveDates()