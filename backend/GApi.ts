const db = require('./db')
const adip = require('./adip')
import { User } from './models/User'
import { UserDao } from './UserDao'
import { UserTools } from './UserTools'
import { Airport } from './models/Airport'
import { AirportDao } from './AirportDao'
import { AirportTools } from './AirportTools'
import { Sheet } from './models/Sheet'
import { SheetDao } from './SheetDao'

// Google API key

export class GApiError {
    status:number;
    message:string;
    constructor(status:number, message:string) {
        this.status = status;
        this.message = message;
    }
}

export class GApi {

    public static async authenticate(body:any):Promise<any> {
        try {
            const user:User = await UserTools.authenticate(body);
            const output:any = user.getMini();
            // console.log('[gapi.authenticate]', JSON.stringify(output))
            output.sheets = await SheetDao.getListForUser(user.id);
            // console.log('[gapi.authenticate]', JSON.stringify(output))
            return output;
        } catch(e) {
            throw new GApiError(400, e.message)
        }
    }

    public static async createCustomAirport(userSha256:string,airport:any) {
        // console.log('[gapi.createCustomAirport]', userSha256, airport)
        // resolve user
        const userId = await UserDao.find(userSha256)
        // update record
        if( !userId) throw new GApiError(400,"Invalid User"); 

        return await AirportDao.createOrUpdateCustom(airport, userId)
    }

    /**
     * Get an airport either from postgres or ADIP
     * @param {*} codeParam airport code
     * @param {*} userId pass a value consider custom airports
     * @param {*} force set to true to bypass postgres
     * @returns airport object or undefined if not found
     * @throws 400 if code is invalid 
    */
    public static async getAirport(codeParam:string,userId: any=undefined):Promise<Airport|undefined> {
        // console.log( "[gapi.getAirport] " + codeParam + ' user=' + userId);
        // try postgres first unless we are in force mode
        let airport = null;
        const code = codeParam.toUpperCase()

        // weed out the crap
        if( !AirportTools.isValidAirportCode(code)) throw new GApiError(400,"Invalid Airport Code"); 

        const airports = await AirportDao.readList( [code], userId); 
        if(airports.length > 0){
            // console.log( "[gapi] found " + code + ' in DB');
            return AirportTools.format(airports[0])
        } 

        return GApi.getAirportFromAdip(code)
    }

    public static async getAirportFromAdip(code:string,save:boolean=true):Promise<Airport|undefined> {
        // console.log( "[gapi.getAirportFromAdip] " + code);

        if( await db.isKnownUnknown(code)) {
            console.log( '[gapi.getAirportFromAdip] ' + code + ' is a known unknown');
            return undefined;
        }

        const airport = await adip.fetchAirport(code);
        if(save) {
            if(airport) { // adip saves the day, persist this airport in postrgres
                // console.log( "[gapi.getAirportFromAdip] found " + code + ' in ADIP');
                // console.log( '[gapi] ' + JSON.stringify(airport));
                await AirportDao.create(code,airport);
            } else { // not found ADIP either, memorize to avoid asking this over and over
                // console.log( "[gapi] Saving " + code + ' in DB as known unknown');
                await db.addKnownUnknown(code);
            }
        }

        // return the airport, even if it's empty
        return airport;
    }

    /**
     * 
     * @param {*} airportCodes A list of airport codes
     * @returns a list of corresponding airport data, which may be undefined
    */
    public static async getAirportsList(airportCodes:string[],userId=undefined) {
        const searchCodes = airportCodes.map( code => code.toUpperCase()) 

        const foundAirports:any[] = await AirportDao.readList(searchCodes,userId)
        // console.log( "[gapi.getAirportsList] found " + JSON.stringify(foundAirports));

        return foundAirports.map( airport => AirportTools.format(airport))
    }

    /**
     * Turn code into an ICAO code
     * @param {*} code anything to be turned into an ICAO code
     * @returns a four letter icao code or null if not valid
    */
    public static getIcao(code:string):string|null {
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

    static getLocId(code:string) {
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


    public static isMilitary(freq:string) {
        if( freq == null) return false;
        if( freq =='-.-') return false;
        return !adip.isNotMilitary(freq)
    }

    /**
     * Gets a sheet by id and user id
     * @param sheetId 
     * @param userId 
     * @returns 
     * @throws 404 if not found
     */
    public static async sheetGetData(sheetId:number,userId:number):Promise<any> {
        const sheet:Sheet|undefined = await SheetDao.readById(sheetId, userId)
        // console.log( '[gapi.sheetGet] ' + sheetId + ' -> ' + output)
        if( sheet) return sheet.data
        throw new GApiError(404, 'Sheet not found')
    }

    public static async sheetGetList(userId:number):Promise<Sheet[]> {
        const sheets:Sheet[] = await SheetDao.getListForUser(userId)
        // console.log( '[gapi.sheetGetList] ' + output)
        return sheets
    }

    /**
     * Save a new sheet in DB or update it if it's existing
     * @param userSha256 
     * @param name 
     * @param data 
     * @returns Sheet name
     * @throws
     */
    public static async sheetSave(userSha256:string, name:string, data:any):Promise<string> {
        // console.log( '[gapi.sheetSave]', user, name, data);
        const userId:number|undefined = await UserDao.find(userSha256)
        // update record
        if( !userId) throw new GApiError( 400,"Invalid user");

        await SheetDao.createOrUpdate(name, data, userId)
        return name
    }
}
