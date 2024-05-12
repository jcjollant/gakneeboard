// force pull the data for all airports that have an old version


const postgres = require('@vercel/postgres')
process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"
const gapi = require( '../backend/gapi')
const adip = require( '../backend/adip')
const db = require( '../backend/db')

async function refreshAirport(code,id) {
    airport = await adip.fetchAirport(code);
    if(airport) { // adip saves the day, persist this airport in postrgres
        console.log( "[gapi] found " + code + ' in ADIP');
        // console.log( '[gapi] ' + JSON.stringify(airport));
        await db.updateAirport(id,airport,adip.modelVersion);
        console.log( 'upgraded ' + code + ' at id ' + id)
    } else {
        console.log( "Upgrade failed for " + row.code);
    }

}

async function upgradeVersion() {
    const minVersion = 3;
    const result = await postgres.sql`SELECT Code,Id FROM Airports WHERE version < ${minVersion} LIMIT 5`

    console.log( "Matching airports " + result.rowCount)

    result.rows.forEach( async (row) => {
        refreshAirport(row.code, row.id)
    })
}

async function findMilitaryFrequencies() {
    const result = await postgres.sql`SELECT * FROM Airports`
    const candidate = result.rows.filter( row => {
        const airport = JSON.parse(row.data);
        let gndIsMilitary = gapi.isMilitary( airport.gnd)
        let weatherIsMilitary = gapi.isMilitary( airport.weather.freq)
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
findMilitaryFrequencies()