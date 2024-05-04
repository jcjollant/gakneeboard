const db = require('./db')
const adip = require('./adip')

function getAirportCodes(source) {
    let airportCode = null;
    let icaoCode = null;
    if( source && source.length == 4) {
        airportCode = source.substring(1).toUpperCase();
        icaoCode = source.toUpperCase();
    } else if( source && source.length == 3) {
        airportCode = source.toUpperCase();
        icaoCode = 'K' + airportCode;
    }
    
    return [airportCode,icaoCode];
}

// Get an airport either from postgres or ADIP
// @return airport object or null if not found
async function getAirport(airportCode,icaoCode,force=false) {
    console.log( "getAirport DB for " + airportCode + "/" + icaoCode + (force ? ' forced' : ''));
    // try postgres first unless we are in force mode
    let airport = force ? null : db.fetchAirport(airportCode,icaoCode);

    // known unknown
    if( airport == {}) return null;
    // DB found it, return it
    if( airport) return airport

    // DB didn't help, try ADIP
    airport = await adip.fetchAirport(airportCode);
    if(airport) { // adip saves the day, persist this airport in postrgres
        console.log( "found " + airportCode + ' in ADIP');
        // console.log( JSON.stringify(airport));
        db.saveAirport(airport['code'],airport);
    } else { // not found ADIP either, memorize to avoid asking this over and over
        console.log( "Saving " + airportCode + ' in DB as known unknown');
        db.saveAirport(airportCode,{});
    }

    // return the airport, even if it's empty
    return airport;
}

module.exports = { getAirportCodes, getAirport }