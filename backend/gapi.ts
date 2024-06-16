const db = require('./db')
const adip = require('./adip')
import { UserDao } from './UserDao'
import { AirportDao } from './AirportDao'
import { AirportTools } from './AirportTools'

// Google API key
 
export class GApi {

    public static async createCustomAirport(userSha256,airport) {
        // console.log('[gapi.createCustomAirport]', userSha256, airport)
        // resolve user
        const userId = await UserDao.find(userSha256)
        // update record
        if( userId) {
            return await AirportDao.createOrUpdateCustom(airport, userId)
        } else {
            throw new Error("User not found")
        }
    }

    /**
     * Get an airport either from postgres or ADIP
     * @param {*} codeParam airport code
     * @param {*} userId pass a value consider custom airports
     * @param {*} force set to true to bypass postgres
     * @returns airport object or undefined if not found
     * @throws 400 if code is invalid 
    */
    public static async getAirport(codeParam,userId=undefined) {
        // console.log( "[gapi.getAirport] " + codeParam + ' user=' + userId);
        // try postgres first unless we are in force mode
        let airport = null;
        const code = codeParam.toUpperCase()

        // weed out the crap
        if( !AirportTools.isValidAirportCode(code)) throw { status:400,message:"Invalid code"}; 

        const airports = await AirportDao.readList( [code], userId); 
        if(airports.length > 0){
            console.log( "[gapi] found " + code + ' in DB');
        return AirportTools.format(airports[0])
        } 

        return GApi.getAirportFromAdip(code)
    }

    public static async getAirportFromAdip(code) {
        // console.log( "[gapi.getAirportFromAdip] " + code);

        if( await db.isKnownUnknown(code)) {
            console.log( '[gapi.getAirportFromAdip] ' + code + ' is a known unknown');
            return undefined;
        }

        const airport = await adip.fetchAirport(code);
        if(airport) { // adip saves the day, persist this airport in postrgres
            console.log( "[gapi.getAirportFromAdip] found " + code + ' in ADIP');
            // console.log( '[gapi] ' + JSON.stringify(airport));
            await AirportDao.create(code,airport);
        } else { // not found ADIP either, memorize to avoid asking this over and over
            // console.log( "[gapi] Saving " + code + ' in DB as known unknown');
            await db.addKnownUnknown(code);
        }

        // return the airport, even if it's empty
        return airport;
    }

    /**
     * 
     * @param {*} airportCodes A list of airport codes
     * @returns a list of corresponding airport data, which may be undefined
    */
    public static async getAirportsList(airportCodes,userId=undefined) {
        const searchCodes = airportCodes.map( code => code.toUpperCase()) 

        const foundAirports = await AirportDao.readList(searchCodes,userId)
        // console.log( "[gapi.getAirportsList] found " + JSON.stringify(foundAirports));

        return foundAirports.map( airport => AirportTools.format(airport))
    }

    /**
     * Turn code into an ICAO code
     * @param {*} code anything to be turned into an ICAO code
     * @returns a four letter icao code or null if not valid
    */
    public static getIcao(code):string|null {
        const output = null
        if( AirportTools.isValidAirportCode(code)) {
            if( code.length == 3) {
                return ('K' + code.toUpperCase())
            } else if( code.length == 4) {
                return code.toUpperCase()
            }
        }
        return null
    }

    static getLocId(code) {
        const output = null

        if( AirportTools.isValidAirportCode(code)) {
            if( code.length == 3) {
                return code.toUpperCase()
            } else if( code.length == 4) {
                return code.substring(1, 4).toUpperCase()
            }
        }
        return null
    }

    public static isMilitary(freq) {
        if( freq == null) return false;
        if( freq =='-.-') return false;
        return !adip.isNotMilitary(freq)
    }
}
