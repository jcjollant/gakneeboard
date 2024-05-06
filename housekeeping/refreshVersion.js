// force pull the data for all airports that have an old version


const postgres = require('@vercel/postgres')
process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"
// const gapi = require( '../backend/gapi')
const adip = require( '../backend/adip')
const db = require( '../backend/db')

async function upgradeVersion() {
    const minVersion = 3;
    const result = await postgres.sql`SELECT Code,Id FROM Airports WHERE version < ${minVersion} LIMIT 5`

    console.log( "Matching airports " + result.rowCount)

    result.rows.forEach( async (row) => {
        airport = await adip.fetchAirport(row.code);
        if(airport) { // adip saves the day, persist this airport in postrgres
            console.log( "[gapi] found " + row.code + ' in ADIP');
            // console.log( '[gapi] ' + JSON.stringify(airport));
            await db.updateAirport(row.id,airport,adip.modelVersion);
            console.log( 'upgraded ' + row.code + ' at id ' + row.id)
        } else {
            console.log( "Upgrade failed for " + row.code);
        }
    })
}

// const output = []
// result.rows.forEach( row => {
//     // console.log( "found on DB entry " + JSON.stringify(row))
//     const airport = JSON.parse(row.data);
//     output.push(airport)
// })

// return output

upgradeVersion()