const db = require('./db')
import axios from 'axios'
import { Adip } from '../backend/Adip'
import { Airport, versionInvalid } from './models/Airport'
import { AirportDao } from './AirportDao'
import { AirportView } from './models/AirportView'
import { User } from './models/User'
import { UserDao } from './UserDao'
import { UserTools } from './UserTools'
import { Publication } from './models/Publication'
import { PublicationDao } from './PublicationDao'
import { Sheet } from './models/Sheet'
import { SheetDao } from './SheetDao'
import { Sunlight } from './models/Sunlight'

// Google API key

const maxSheets:number = 10

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
            let message = ''
            if(e instanceof Error) {
                message = e.message
            }
            throw new GApiError(400, message)
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
     * @returns airport object or undefined if not found
     * @throws 400 if code is invalid 
    */
    public static async getAirport(codeParam:string,userId: any=undefined):Promise<Airport|undefined> {
        // console.log( "[gapi.getAirport] " + codeParam + ' user=' + userId);
        // there is only one element and we only care about the airport
        if(!Airport.isValidCode(codeParam)) throw new GApiError(400, "Invalid Airport Code");
        let code:string
        let airport:Airport|undefined
        [code,airport] = (await GApi.getAirportList([codeParam], userId))[0];
        return airport
    }

    public static async getAirportList(airportCodes:string[],userId:any=undefined):Promise<([string,Airport|undefined])[]> {
        const upperCodes:string[] = airportCodes.map( code => code.toUpperCase()) 
        const airports:[string,Airport][] = await AirportDao.readList(upperCodes, userId)
        // rebuild the full list along with unknowns(undefined)
        const output:([string,Airport|undefined])[] = []
        for( const code of upperCodes) {
            // store the found value [code,airport]
            const found = airports.find( ([upperCode,airport]) => upperCode == code)
            // console.log('[GApi.getAirportList] found', found, 'code', code)
            if(found) {
                const airport:Airport = found[1]
                if( airport.custom) { 
                    // we don't update custom airports
                    output.push([code, airport])
                } else if( airport.version == versionInvalid) {
                    // this is a known unknown
                    output.push([code, undefined])
                } else { // the airport now looks legitimate for an update
                    // check whether data is current
                    const versionCurrent:boolean = (airport.version == Airport.currentVersion);
                    const dateCurrent:boolean = (airport.effectiveDate == Adip.currentEffectiveDate)
                    // We don't update if data is already current
                    if( versionCurrent && dateCurrent) {
                        // console.log("[GApi.sanitize] ", airportId, "sane")
                        output.push([code, airport])
                    } else {
                        // data needs to be refeshed => Adip
                        let refresher:Airport|undefined = await Adip.fetchAirport(code)
                        if( refresher) {
                            // update this record in the database
                            if( airport.id) { 
                                await AirportDao.updateAirport(airport.id, refresher)
                            } else {
                                console.log('[GApi.getAirportList] Could not update', code, 'due to missing Id')
                            }
                            output.push([code, refresher])
                        } else {
                            // well, we tried but there is something fishy as this code was known before
                            console.log('[GApi.getAirportList] Adip could not refresh', code)
                            output.push([code, airport])
                        }
                    }
    
                }
            } else { // code not found
                if( Airport.isValidCode(code)) {
                    // First time we see that code => Adip
                    let firstTimer:Airport|undefined = await Adip.fetchAirport(code)

                    // memorize this for next time
                    if(firstTimer && firstTimer.code != '?') {
                        await AirportDao.create(code, firstTimer);
                    } else {
                        await AirportDao.createUnknown(code);
                    }
                    output.push([code, firstTimer])
                } else {
                    output.push([code, undefined])
                }
            }
        }
        return output
    }

    public static async getAirportView(codeParam:string, userId: any=undefined):Promise<AirportView|undefined> {
        if( !Airport.isValidCode(codeParam)) throw new GApiError(400, "Invalid Airport Code");
        const list = await GApi.getAirportViewList([codeParam], userId)
        return list[0]
    }    

    /**
     * 
     * @param {*} airportCodes A list of airport codes
     * @returns a list of corresponding airport data, which may be undefined
    */
    public static async getAirportViewList(airportCodes:string[],userId=undefined):Promise<(AirportView|undefined)[]> {
        // console.log('[GApi.getAirportViewList] codes', JSON.stringify(airportCodes), 'user', userId)
        const airports:([string,Airport|undefined])[] = await GApi.getAirportList(airportCodes, userId)
        // console.log('[GApi.getAirportViewList]', JSON.stringify(airports))

        return airports.map( ([code,airport]) => {
            // console.log('[GApi.getAirportViewList]', code, airport)
            return airport ? new AirportView(airport) : AirportView.getUndefined(code)
        })
    }

    /**
     * 
     * @param from 
     * @param to 
     * @param dateFrom is anumber such as 20240624
     * @returns 
     */
    public static async getSunlight( from:string, to:string, dateFrom:number, dateTo:number|undefined=undefined):Promise<Sunlight|undefined> {
        // Always get the from data
        const fromData:any|undefined = await GApi.getSunriseData(from, dateFrom)
        // console.log('[GApi.getSunlight] fromData', JSON.stringify(fromData))
        if(!fromData) return undefined
        if(!dateTo) dateTo = dateFrom
        if( to == from && dateFrom == dateTo) { // we are going to the same place on the same day
            // console.log('[GApi.getSunlight] from = ' + from)
            return new Sunlight(fromData)
        } else { // we are going to a different place or returning on a different date
            // console.log('[GApi.getSunlight] to = ' + to)
            const toData:any|undefined = await GApi.getSunriseData(to, dateTo)
            // console.log('[GApi.getSunlight] toData', JSON.stringify(toData))
            return new Sunlight(fromData, toData, dateFrom != dateTo)
        }
    }

    public static async getSunriseData(airportCode:string, date:number):Promise<any | undefined> {
        const airport:Airport|undefined = await GApi.getAirport(airportCode)
        // const airportTo:Airport = await GApi.getAirport(to)
        // console.log('[GApi.getSunlight]', airportCode, airport)
        if( !airport || !airport.location) return undefined
        const dateString:string = Math.trunc(date / 10000) + '-' + Math.trunc(date / 100 % 100) + '-' + (date % 100)
        const url:string = 'https://api.sunrisesunset.io/json?lat=' + airport.location.lat + '&lng=' + airport.location.lon + '&date=' + dateString;
        let data:any|undefined = undefined
        await axios.get(url).then( response => {
            // console.log('[GApi.getSunriseData]', JSON.stringify(response.data))
            data = response.data
        }).catch( error => {
            console.log(error)
        })
        return data
    }

    /**
     * Turn code into an ICAO code
     * @param {*} code anything to be turned into an ICAO code
     * @returns a four letter icao code or null if not valid
    */
    public static getIcao(code:string):string|null {
        const output = null
        if( Airport.isValidCode(code)) {
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

        if( Airport.isValidCode(code)) {
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
        return Adip.isMilitary(Number(freq))
    }

    public static async sheetGetByCode(code:string):Promise<Sheet|undefined> {
        const pub:Publication|undefined = await PublicationDao.findByCode(code)
        if(!pub || !pub.sheetid) return undefined
        return SheetDao.readById(pub.sheetid)
    }

    /**
     * Delete a sheet by id and user id
     * @param sheetId 
     * @param userId 
     * @returns 
     */
    public static async sheetDelete(sheetId:number, userId:number):Promise<string> {
        const sheet:Sheet|undefined = await SheetDao.readById(sheetId, userId)
        // console.log( '[gapi.sheetDelete] ' + sheetId + ' -> ' + output)
        if( sheet) {
            await SheetDao.delete(sheetId, userId)
            return sheet.name
        }
        throw new GApiError(404, 'Sheet not found');
    }

    /**
     * Gets a sheet by id and user id
     * @param sheetId 
     * @param userId 
     * @returns 
     * @throws 404 if not found
     */
    public static async sheetGet(sheetId:number,userId:number):Promise<any> {
        const sheet:Sheet|undefined = await SheetDao.readById(sheetId, userId)
        // console.log( '[gapi.sheetGet] ' + sheetId + ' -> ' + output)
        if( sheet) return sheet
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
    public static async sheetSave(userSha256:string, sheet:Sheet):Promise<Sheet> {
        // console.log( '[gapi.sheetSave]', user, name, data);
        const userId:number|undefined = await UserDao.find(userSha256)
        // update record
        if( !userId) throw new GApiError( 400,"Invalid user");

        const newSheet:Sheet = await SheetDao.createOrUpdate(sheet, userId, maxSheets)
        if(sheet.publish) {
            // we need to create a new publication
            const newPublication = await PublicationDao.publish(newSheet.id)
            // console.log('[GApi.sheetSave] publication', JSON.stringify(newPublication)); 
            if(!newPublication) throw new GApiError(500, "Publication failed");
            newSheet.code = newPublication.code;
        } else {
            // we need to unpublish that sheet
            await PublicationDao.unpublish(newSheet.id)
            newSheet.code = undefined;
        }
        // otherwise, sheet publication status is current
        // console.log('[GApi.sheetSave]', JSON.stringify(newSheet)); 
        return newSheet;
    }

    /**
     * Finds a user id by it's sha256
     * @param sha256 User sha256
     * @returns User Id or undefined if not found
     */
    public static async userShaToId(sha256:string):Promise<number|undefined> {
        return await UserDao.find(sha256)
    }
}
