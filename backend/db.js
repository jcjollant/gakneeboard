const postgres = require('@vercel/postgres')
const userModelVersion = 1
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
    // console.log( '[db] fetchAirportList found ' + result.rowCount + ' entries')
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
    await postgres.sql`INSERT INTO Airports (Code, Data, Version) VALUES (${code}, ${data},${data.version})`;
    console.log( '[db.saveAirport] ' + code)
}

async function saveFeedback(data) {
    console.log( '[db.saveFeedback] ')
    if( 'user' in data) {
        await postgres.sql`INSERT INTO Feedback (Version,Text,user256) VALUES (${data.version},${data.feedback},${data.user})`;
    } else {
        await postgres.sql`INSERT INTO Feedback (Version,Text) VALUES (${data.version},${data.feedback})`;
    }

}

async function saveUser(user) {
    console.log( '[db.saveUser]  ' + JSON.stringify(user))

    try {
        if( !user.sha256) throw new Error('sha256 missing')
        const result = await postgres.sql`SELECT id from Users WHERE sha256 = ${user.sha256}`;
        console.log( '[db.saveUser] match count ' + result.rowCount)
        if(result.rowCount == 0) {
            console.log( '[db.saveUser] adding ' + user.sha256)
            await postgres.sql`INSERT INTO Users (sha256,data,version) VALUES (${user.sha256},${user},${userModelVersion})`
            // console.log( '[db.saveUser] ' + user.sha256)
        } else {
            console.log( '[db.saveUser] known user ' + user.sha256)
        }
        return user
    } catch(e) {
        console.log( '[db.saveUser] failed ' + e.message);
        return null
    }
}

async function updateAirport(id, data, version) {
    // console.log( '[db] updateAirport ' + id + ' ' + JSON.stringify(data) + ' ' + version)
    await postgres.sql`UPDATE Airports SET Data=${data}, Version = ${version} WHERE id=${id}`;
}

module.exports = { addKnownUnknown, fetchAirport, fetchAirportList, isKnownUnknown, saveAirport, 
    saveFeedback, saveUser, updateAirport
 };