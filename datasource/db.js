const postgres = require('@vercel/postgres')

// Looks for an airport in the database
// @return {Object} airport object, null if not found or {} if it is a known unknown
async function fetchAirport( airportCode, icaoCode) {
    let airport = null;
    let result = null;

    if( icaoCode) { // try locId and icao
        const icaoCode = 'K'+airportCode;
        result = await postgres.sql`SELECT Data FROM Airports WHERE Code in (${airportCode},${icaoCode})`;
    } else {
        result = await postgres.sql`SELECT Data FROM Airports WHERE Code= ${airportCode}`;
    }

    if( result.rows.length > 0) { // happy path, airport was not found in postgres
        // console.log( JSON.stringify(result.rows[0]))
        if(result.rows[0].data != '{}') {
            console.log( "found " + airportCode + ' in DB');
            airport = JSON.parse(result.rows[0].data);
        } else {
            console.log( airportCode + " is a known unknown")
            airport = {};
        }
    }

    return airport
}

async function saveAirport(code, data) {
    await postgres.sql`INSERT INTO Airports (Code, Data) VALUES (${code}, ${data})`;
}

module.exports = { fetchAirport, saveAirport };