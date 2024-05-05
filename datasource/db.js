const postgres = require('@vercel/postgres')

/**
 * adds a known unknown to the DB
 * @param {*} code whatever was recevied from the caller
 */
async function addKnownUnknown(code) {
    console.log( '[db] addKnownUnknown ' + code)
    await postgres.sql`INSERT INTO Unknowns (Code) VALUES (${code})`;
}

/**
 * gets an airport from the DB
 * @param {*} code a four letter icao code
 * @returns {Object} airport object or null if not found
 */
async function fetchAirport( code1, code2) {
    // console.log( '[db] fetchAirport ' + code)
    const airports = await fetchAirportList([code1, code2])
    // console.log('[db] airports list output ' + JSON.stringify(airports))
    if(airports && airports.length > 0) return airports[0]
    return null
}

async function fetchAirportList(list) {
    // console.log( '[db] fetchAirportList ' + JSON.stringify(list))

    const result = await postgres.sql`SELECT Data FROM Airports WHERE Code = ANY(${list})`;
    // console.log( '[db] fetchAirportList result ' + JSON.stringify(result))

    const output = []
    result.rows.forEach( row => {
        // console.log( "found on DB entry " + JSON.stringify(row))
        const airport = JSON.parse(row.data);
        output.push(airport)
    })

    return output
}

/**
 * Figure out if a code is already unknown
 * @param {*} code 
 * @returns 
 */
async function isKnownUnknown(code) {
    const result = await postgres.sql`SELECT * FROM Unknowns WHERE Code = ${code}`;

    return result.rowCount > 0
}

async function saveAirport(code, data) {
    await postgres.sql`INSERT INTO Airports (Code, Data) VALUES (${code}, ${data})`;
    console.log( '[db] saveAirport ' + code)
}

module.exports = { addKnownUnknown, fetchAirport, fetchAirportList, isKnownUnknown, saveAirport };