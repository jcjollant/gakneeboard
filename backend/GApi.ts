import axios from 'axios'
import { Adip } from '../backend/adip/Adip'
import { AirportDao } from './AirportDao'
import { Business } from './business/Business'
import { Email, EmailType } from './Email'
import { Exporter } from './Exporter'
import { UserTools } from './UserTools'
import { version } from './constants'
import { UsageDao, UsageType } from './dao/UsageDao'
import { UserDao } from './dao/UserDao'
import { Airport, versionInvalid } from './models/Airport'
import { AirportView } from './models/AirportView'
import { FeedbackDao } from './FeedbackDao'
import { Publication } from './models/Publication'
import { PublicationDao } from './PublicationDao'
import { PublishedTemplate } from './models/PublishedTemplate'
import { Sunlight } from './models/Sunlight'
import { Template } from './models/Template'
import { TemplateDao } from './TemplateDao'
import { TemplateView } from './models/TemplateView'
import { User } from './models/User'
import { UserMiniView } from './models/UserMiniView'
import { CodeAndAirport } from './models/CodeAndAirport'
import { AirportSketch } from './AirportSketch'

// Google API key

export class GApiError {
    status:number;
    message:string;
    constructor(status:number, message:string) {
        this.status = status;
        this.message = message;
    }
}

export class TemplateStatus {
  code:number; // HttpsStatusCode
  template:TemplateView;
  constructor(code:number, template:TemplateView) {
    this.code = code
    this.template = template
  }
}

export class GApi {

    public static async authenticate(body:any):Promise<UserMiniView> {
        try {
            const user:User = await UserTools.authenticate(body);
            const templates:TemplateView[] = await TemplateDao.getOverviewListForUser(user.id);
            const output:UserMiniView = new UserMiniView(user, templates);
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
        const userId = await UserDao.getIdFromHash(userSha256)
        // update record
        if( !userId) throw new GApiError(400,"Invalid User"); 

        return await AirportDao.createOrUpdateCustom(airport, userId)
    }

    /**
     * Export a template into one of the supported formats
     * @param templateId Source template id
     * @param userSha256 User identifier
     * @param format Target format as defined in @class Exporter
     * @returns on Exporter object on success. May also throw a GApiError
     */
    public static async exportTemplate(templateId:number, userSha256:string, format:string):Promise<Exporter> {
        // console.log('[gapi.exportTemplate]', templateId, userSha256, format)
        // Fetch user
        const userId:number|undefined = await UserDao.getIdFromHash(userSha256)
        if( !userId) throw new GApiError(400, "Invalid User");
        // Fetch template for user
        const template:TemplateView|undefined = await TemplateDao.readById(templateId, userId)
        if( !template) throw new GApiError(400, "Invalid Template");

        const exportData = {format:format}
        // perform export and save usage
        const [exporter, isSaved] = await Promise.all([
            // retrieve this template for this user
            Exporter.export(template, format), 
            // Save usage
            UsageDao.create(UsageType.Export, userId, JSON.stringify(exportData))
        ])
        return exporter
    }

    public static async feedbackSave(payload:any):Promise<void> {
        return FeedbackDao.save(payload.version, payload.feedback, payload.user).then( async ()=>{
            await Email.send(payload.feedback,EmailType.Feedback)
        })
    }

    public static getAirportCurrentEffectiveDate() {
        return AirportView.formatAsOf( Adip.currentEffectiveDate)
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
        const codeAndAirport = (await GApi.getAirportList([codeParam], userId))[0];
        return codeAndAirport.airport
    }

    /**
     * Evaluates whether an airport needs to be refreshed due to model change or effectiveDate
     * @param code Clear Airport code
     * @param airports List of known airports
     * @returns The corresponding match, which could have an undefined Airport
     */
    static async getAirportCurrent(code:string, airports:CodeAndAirport[]):Promise<CodeAndAirport> {
        // console.log('[GApi.getAirportCurrent]', code)
        // store the found value [code,airport]
        const found = airports.find( (codeAndAirport) => codeAndAirport.code == code)

        // Unknown stuff : Invalid Code / Legit New / Unknown valid code
        if(!found) {
            // invalid code =>
            if( !Airport.isValidCode(code)) return CodeAndAirport.undefined(code)

            // First time we see that code => Adip
            let firstTimer:Airport|undefined = await Adip.fetchAirport(code)

            // unknown airport
            if(!firstTimer || firstTimer.code == '?') {
                await AirportDao.createUnknown(code);
                return CodeAndAirport.undefined(code)
            }
            // new airport
            await AirportDao.create(code, firstTimer);
            // await AirportSketch.resolve(firstTimer)
            return new CodeAndAirport(code, firstTimer)
        }

        // console.log('[GApi.getAirportList] found', found.code)
        const airport:Airport = found.airport

        // Is this a known unknown?
        if( !airport || airport.version == versionInvalid) {
            return CodeAndAirport.undefined(code)
        } 
        

        const versionCurrent:boolean = (airport.version == Airport.currentVersion);
        const dateCurrent:boolean = (airport.effectiveDate == Adip.currentEffectiveDate)
        // Happy path : data is already current or airport is custom (which we don't update)
        if( airport.custom || versionCurrent && dateCurrent) { 
            return new CodeAndAirport(code, airport)
        } 

        // data needs to be refreshed => Adip
        let refresher:Airport|undefined = await Adip.fetchAirport(code)
        if( refresher) {
            // update this record in the database
            if( airport.id) { 
                await AirportDao.updateAirport(airport.id, refresher)
                // consider refreshing the skecth
                // if(!refresher.sketch) await AirportSketch.resolve(refresher, code)
            } else {
                console.log('[GApi.getAirportCurrent] Could not update', code, 'due to missing Id')
            }
            return new CodeAndAirport(code, refresher)
        } 

        // well, we tried but there is something fishy as this code was known before but Adip failed
        console.log('[GApi.getAirportCurrent] Adip could not refresh', code)
        return new CodeAndAirport(code, airport)
    }

    /**
     * Builds a list of airports from a list of codes
     * @param airportCodes 
     * @param userId 
     * @returns 
     */
    public static async getAirportList(airportCodes:string[],userId:any=undefined):Promise<(CodeAndAirport)[]> {
        // clean up airport codes
        const cleanCodes:string[] = airportCodes.map( code => Airport.cleanupCode(code)) 
        // Read airports fromDB
        const knownAirports:CodeAndAirport[] = await AirportDao.readList(cleanCodes, userId)
        // rebuild the full list along with unknowns(undefined)
        const output:(Promise<CodeAndAirport>)[] = []
        for( const code of cleanCodes) {
            output.push( GApi.getAirportCurrent(code, knownAirports))
        }
        return Promise.all(output)
    }

    public static async getAirportView(codeParam:string, userId: any=undefined):Promise<AirportView> {
        if( !Airport.isValidCode(codeParam)) throw new GApiError(400, "Invalid Airport Code");
        const list = await GApi.getAirportViewList([codeParam], userId)
        return list[0]
    }    

    /**
     * 
     * @param {*} airportCodes A list of airport codes
     * @returns a list of corresponding airport data, which may be undefined
    */
    public static async getAirportViewList(airportCodes:string[],userId=undefined):Promise<AirportView[]> {
        // console.log('[GApi.getAirportViewList] codes', JSON.stringify(airportCodes), 'user', userId)
        const airports:(CodeAndAirport)[] = await GApi.getAirportList(airportCodes, userId)
        // console.log('[GApi.getAirportViewList]', JSON.stringify(airports))

        const output = airports.map( (codeAndAirport) => {
            // console.log('[GApi.getAirportViewList]', code, airport)
            return codeAndAirport.airport ? new AirportView(codeAndAirport.airport) : AirportView.getUndefined(codeAndAirport.code)
        })

        return output
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

    public static async getSession(req:any):Promise<any> {
        const output:any = {
            version: version,
            aced: GApi.getAirportCurrentEffectiveDate(),
            camv: AirportView.currentVersion,
        }
        // Enrich with user data if possible
        const sha = UserTools.userShaFromRequest(req)
        if( sha) {
            const user:User|undefined = await UserDao.getUserFromHash(sha)
            // console.log('[userTools.userMiniFromRequest] user ' + JSON.stringify(user))
            if( user) {
                const userMini = await UserTools.userMini(user)
                output['user'] = userMini
                UsageDao.create(UsageType.Session,user.id)
            }
        }
        // console.log('[GApi.getSession]', JSON.stringify(output))    
        return output
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
        // console.log('[GApi.getSunriseData]', url)
        let data:any|undefined = undefined
        await axios.get(url).then( response => {
            // console.log('[GApi.getSunriseData]', JSON.stringify(response.data))
            data = response.data
        }).catch( error => {
            console.log(error)
        })
        return data
    }

    public static isMilitary(freq:string) {
        if( freq == null) return false;
        if( freq =='-.-') return false;
        return Adip.isMilitary(Number(freq))
    }

    public static async printRequest(userSha:string|undefined,payload:string):Promise<boolean> {
        // console.log('[GApi.printSave]', userSha, payload)
        try {
            const userDao = new UserDao()
            let userId = 0
            if(userSha) {
                const user = await userDao.getFromHash(userSha)
                if(user) {
                    userId = user.id
                    Business.printConsume(user, userDao)
                }
            }
            await UsageDao.create(UsageType.Print, userId, payload)
            return true;
        } catch( e) {
            return false;
        }
    }

    public static async publicationGet(code:string):Promise<TemplateView|undefined> {
        const pub:Publication|undefined = await PublicationDao.findByCode(code)
        if(!pub || !pub.templateId) throw new GApiError(404, 'Publication not found');
        return TemplateDao.readById(pub.templateId)
    }

    // Get a list of published templates
    public static async publicationGetList():Promise<PublishedTemplate[]> {
        const pubs:PublishedTemplate[] = await PublicationDao.list()
        return pubs
    }

    /**
     * Delete a sheet by id and user id
     * @param templateId 
     * @param userId 
     * @returns 
     */
    public static async templateDelete(templateId:number, userId:number):Promise<string> {
        return new Promise<string>( async (resolve, reject) => {
            const template:TemplateView|undefined = await TemplateDao.readById(templateId, userId)
            // console.log( '[gapi.sheetDelete] ' + sheetId + ' -> ' + output)
            if( template) {
                await TemplateDao.delete(templateId, userId)
                return resolve( template.name)
            }
            reject( new GApiError(404, 'Template not found'))
        })
    }

    /**
     * Gets a sheet by id and user id
     * @param templateId 
     * @param userId 
     * @returns 
     * @throws 404 if not found
     */
    public static async templateGet(templateId:number,userId:number):Promise<TemplateView|undefined> {
        const template:TemplateView|undefined = await TemplateDao.readById(templateId, userId)
        // console.log( '[gapi.sheetGet] ' + sheetId + ' -> ' + output)
        if( !template) return undefined;
        // is this published?
        const pub:Publication|undefined = await PublicationDao.findByTemplate(template.id)
        template.setPublication(pub);
        
        return template;
    }

    public static async templateGetList(userId:number):Promise<TemplateView[]> {
        const templates:TemplateView[] = await TemplateDao.getOverviewListForUser(userId)
        return templates
    }

    /**
     * Save a new template in DB or update it if it's existing
     * Customers cannot save or create new templates if they are already at or above the limit
     * For new templates, we have a two steps lock down, which will happen gradually
     * Step 1) Customer can save existing templates above the limit
     * Step 2) Customers cannot save existing templates until they are above the limit
     * @param userSha256 User reference
     * @param templateView Whatever needs tob e saved
     * @returns A Template status should be 200 if everything goes fine, 202 if user is within tolerance or 402 if user is over limit
     * @throws
     */
    public static async templateSave(userSha256:string, sheet:any):Promise<TemplateStatus> {
        return new Promise( async (resolve, reject) => {
            // Check templateView is valid
            if( !sheet) {
                // console.log('[GApi.templateSave]', JSON.stringify(sheet))
                return reject( new GApiError(400, 'Invalid template'))
            }
            const templateView:TemplateView = TemplateView.parse(sheet)

            const user = await UserDao.getUserFromHash(userSha256)
            // check user is in good shape
            if( !user) return reject( new GApiError( 400, "Invalid user"));

            const templateCountForUser = await TemplateDao.countForUser(user.id)
            // console.log('[GApi.templateSave]', templateCountForUser, user.accountType)

            // Max limit control
            const maxTemplates = Math.max(Business.maxTemplates(user), user.maxTemplates)
            // We don't allow anything if you are above max 
            if(templateCountForUser > maxTemplates) {
                return reject( new GApiError( 402, "Maximum templates exceeded"))
            }
            // We don't allow creation if you are at max
            if(templateView.id == 0 && templateCountForUser == maxTemplates) {
                return reject( new GApiError( 402, "Maximum templates reached"))
            }

            const template:Template = await TemplateDao.createOrUpdate(templateView, user.id)

            // propgate id and version
            templateView.id = template.id;
            templateView.ver = template.version;

            // Should we check publication?
            if(templateView.publish) {
                // we need to create a new publication
                const newPublication = await PublicationDao.publish(template.id)
                // console.log('[GApi.templateSave] publication', JSON.stringify(newPublication)); 
                if(!newPublication) return reject( new GApiError(500, "Publication failed"));
                templateView.code = newPublication.code;
            } else {
                // we may need to unpublish that template
                await PublicationDao.unpublish(templateView.id)
                templateView.code = undefined;
            }

            // Return OK
            return resolve( new TemplateStatus( 200, templateView));
        })

    }

    /**
     * Finds a user id by it's sha256
     * @param sha256 User sha256
     * @returns User Id or undefined if not found
     */
    public static async userShaToId(sha256:string):Promise<number|undefined> {
        return await UserDao.getIdFromHash(sha256)
    }
}
