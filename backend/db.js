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
 * Figure out if a code is already unknown
 * @param {*} code 
 * @returns 
*/
async function isKnownUnknown(code) {
    const result = await postgres.sql`SELECT * FROM Unknowns WHERE Code = ${code}`;
    
    return result.rowCount > 0
}

async function saveFeedback(data) {
    console.log( '[db.saveFeedback] ')
    if( 'user' in data) {
        await postgres.sql`INSERT INTO Feedback (Version,Text,user256) VALUES (${data.version},${data.feedback},${data.user})`;
    } else {
        await postgres.sql`INSERT INTO Feedback (Version,Text) VALUES (${data.version},${data.feedback})`;
    }

}

module.exports = { addKnownUnknown, isKnownUnknown, saveFeedback};