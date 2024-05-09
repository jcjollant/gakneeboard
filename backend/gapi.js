const db = require('./db')
const adip = require('./adip')

function isValidCode(source) {
    if(source) {
        return source.length == 3 || source.length == 4;
    }

    return false;
}

// Get an airport either from postgres or ADIP
// @return airport object or null if not found
async function getAirport(codeParam,force=false) {
    // console.log( "getAirport DB for " + code + (force ? ' forced' : ''));
    // try postgres first unless we are in force mode
    let airport = null;
    const code = codeParam.toUpperCase()

    // weed out the crap
    if( !isValidCode(code)) return null; 

    if( force) {
        console.log( "force mode, skipping DB");
    } else {
        if( await db.isKnownUnknown(code)) {
            console.log( '[gapi] ' + code + ' is a known unknown');
            return null;
        }
        airport = await db.fetchAirport(code); 
        // console.log('[gapi] db.fetchAirport output ' + JSON.stringify(airport))
        if(airport){
            console.log( "[gapi] found " + code + ' in DB');
            return airport
        } 
    }

    // DB didn't help, try ADIP
    airport = await adip.fetchAirport(code);
    if(airport) { // adip saves the day, persist this airport in postrgres
        console.log( "[gapi] found " + code + ' in ADIP');
        // console.log( '[gapi] ' + JSON.stringify(airport));
        await db.saveAirport(code,airport);
    } else { // not found ADIP either, memorize to avoid asking this over and over
        // console.log( "[gapi] Saving " + code + ' in DB as known unknown');
        await db.addKnownUnknown(code);
    }

    // return the airport, even if it's empty
    return airport;
}

async function getAirportsList(list) {
    // console.log( "[gapi] getAirportsList " + JSON.stringify(list));
    const output = []
    for( const code of list) {
        const airport = await getAirport(code)
        output.push(airport)
    }
    return output
}

/**
 * Turn code into an ICAO code
 * @param {*} code anything to be turned into an ICAO code
 * @returns a four letter icao code or null if not valid
 */
function getIcao(code) {
    const output = null
    if( isValidCode(code)) {
        if( code.length == 3) {
            return ('K' + code.toUpperCase())
        } else if( code.length == 4) {
            return code.toUpperCase()
        }
    }
    return null
}

function getLocId(code) {
    const output = null

    if( isValidCode(code)) {
        if( code.length == 3) {
            return code.toUpperCase()
        } else if( code.length == 4) {
            return code.substring(1, 4).toUpperCase()
        }
    }
    return null
}

module.exports = { getAirport, getAirportsList, getIcao, getLocId, isValidCode }