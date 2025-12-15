import axios from 'axios'
import { AirportService } from './AirportService'
// import { Adip } from '../backend/adip/Adip' // Removed
import { Business } from './business/Business'
import { Email, EmailType } from './Email'
import { Exporter } from './Exporter'
import { UserTools } from './UserTools'
import { version } from '../package.json'
import { UsageDao, UsageType } from './dao/UsageDao'
import { UserDao } from './dao/UserDao'
import { Airport } from './models/Airport' // Removed versionInvalid
import { AirportView } from './models/AirportView'
import { FeedbackDao } from './FeedbackDao'
import { Publication } from './models/Publication'
import { PublicationDao } from './PublicationDao'
import { PublishedTemplate } from './models/PublishedTemplate'
import { Sunlight } from './models/Sunlight'
import { TemplateDao } from './TemplateDao'
import { TemplateView } from './models/TemplateView'
import { User } from './models/User'
import { UserMiniView } from './models/UserMiniView'
import { CodeAndAirport } from './models/CodeAndAirport'
import { GApiError } from './GApiError'
import { Template } from './models/Template'
// import { AirportSketch } from './AirportSketch' // Removed
import { SessionInfo } from './models/SessionInfo'

// Google API key

export class GApi {
    public static async acceptEula(userId: number, version: number): Promise<boolean> {
        // console.debug('[GApi.acceptEula]', userId)
        try {
            const userDao = new UserDao()

            // record a new usage for this acceptance and update the user acceptance date
            const data = { version: version }
            await Promise.all([
                UsageDao.create(UsageType.Eula, userId, JSON.stringify(data)),
                userDao.updateEulaAcceptance(userId, version)
            ])
            return true;
        } catch (e) {
            console.error('[GApi.acceptEula]', e)
            return false;
        }
    }


    public static async authenticate(body: any): Promise<UserMiniView> {
        try {
            const user: User = await UserTools.authenticate(body);
            const templates: TemplateView[] = await TemplateDao.getOverviewListForUser(user.id);
            const output: UserMiniView = new UserMiniView(user, templates);
            return output;
        } catch (e) {
            let message = ''
            if (e instanceof Error) {
                message = e.message
            }
            throw new GApiError(400, message)
        }
    }

    // public static async createCustomAirport(userSha256:string,airport:any) {
    //     // console.log('[gapi.createCustomAirport]', userSha256, airport)
    //     // resolve user
    //     const userId = await UserDao.getIdFromHash(userSha256)
    //     // update record
    //     if( !userId) throw new GApiError(400,"Invalid User"); 

    //     return await AirportDao.createOrUpdateCustom(airport, userId)
    // }

    /**
     * Export a template into one of the supported formats
     * @param templateId Source template id
     * @param userSha256 User identifier
     * @param format Target format as defined in @class Exporter
     * @returns on Exporter object on success. May also throw a GApiError
     */
    public static async exportTemplate(templateId: number, userSha256: string, format: string): Promise<Exporter> {
        // console.log('[gapi.exportTemplate]', templateId, userSha256, format)
        // Fetch user
        const userId: number | undefined = await UserDao.getIdFromHash(userSha256)
        if (!userId) throw new GApiError(400, "Invalid User");
        // Fetch template for user
        const template: Template | undefined = await TemplateDao.readByIdStatic(templateId, userId)
        if (!template) throw new GApiError(400, "Invalid Template");

        const exportData = { format: format }
        const templateView = TemplateView.parseTemplate(template)
        // perform export and save usage
        const [exporter, isSaved] = await Promise.all([
            // retrieve this template for this user
            Exporter.export(templateView, format),
            // Save usage
            UsageDao.create(UsageType.Export, userId, JSON.stringify(exportData))
        ])
        return exporter
    }

    public static async feedbackSave(payload: any): Promise<void> {
        return FeedbackDao.save(payload.version, payload.feedback, payload.user, payload.contact).then(async () => {
            await Email.send(payload.feedback, EmailType.Feedback)
        })
    }





    public static async getSession(req: any): Promise<SessionInfo> {
        const output: SessionInfo = {
            version: version,
            aced: AirportService.getAirportCurrentEffectiveDate(),
            camv: AirportView.currentVersion,
        }
        // Enrich with user data if possible
        const sha = UserTools.userShaFromRequest(req)
        if (sha) {
            const user: User | undefined = await UserDao.getUserFromHash(sha)
            // console.log('[userTools.userMiniFromRequest] user ' + JSON.stringify(user))
            if (user) {
                const userMini = await UserTools.userMini(user)
                output.user = userMini
                UsageDao.create(UsageType.Session, user.id)
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
    public static async getSunlight(from: string, to: string, dateFrom: number, dateTo: number | undefined = undefined): Promise<Sunlight | undefined> {
        // Always get the from data
        const fromData: any | undefined = await GApi.getSunriseData(from, dateFrom)
        // console.log('[GApi.getSunlight] fromData', JSON.stringify(fromData))
        if (!fromData) return undefined
        if (!dateTo) dateTo = dateFrom
        if (to == from && dateFrom == dateTo) { // we are going to the same place on the same day
            // console.log('[GApi.getSunlight] from = ' + from)
            return new Sunlight(fromData)
        } else { // we are going to a different place or returning on a different date
            // console.log('[GApi.getSunlight] to = ' + to)
            const toData: any | undefined = await GApi.getSunriseData(to, dateTo)
            // console.log('[GApi.getSunlight] toData', JSON.stringify(toData))
            return new Sunlight(fromData, toData, dateFrom != dateTo)
        }
    }

    public static async getSunriseData(airportCode: string, date: number): Promise<any | undefined> {
        const airport: Airport | undefined = await AirportService.getAirport(airportCode)
        // const airportTo:Airport = await GApi.getAirport(to)
        // console.log('[GApi.getSunlight]', airportCode, airport)
        if (!airport || !airport.location) return undefined
        const dateString: string = Math.trunc(date / 10000) + '-' + Math.trunc(date / 100 % 100) + '-' + (date % 100)
        const url: string = 'https://api.sunrisesunset.io/json?lat=' + airport.location.lat + '&lng=' + airport.location.lon + '&date=' + dateString;
        // console.log('[GApi.getSunriseData]', url)
        let data: any | undefined = undefined
        await axios.get(url).then(response => {
            // console.log('[GApi.getSunriseData]', JSON.stringify(response.data))
            data = response.data
        }).catch(error => {
            console.log(error)
        })
        return data
    }



    public static async printRequest(userSha: string | undefined, payload: string): Promise<boolean> {
        // console.log('[GApi.printSave]', userSha, payload)
        try {
            const userDao = new UserDao()
            let userId = 0
            if (userSha) {
                const user = await userDao.getFromHash(userSha)
                if (user) {
                    userId = user.id
                    Business.printConsume(user, userDao)
                }
            }
            await UsageDao.create(UsageType.Print, userId, payload)
            return true;
        } catch (e) {
            return false;
        }
    }

    public static async publicationGet(code: string): Promise<TemplateView | undefined> {
        const pub: Publication | undefined = await PublicationDao.findByCode(code)
        if (!pub || !pub.templateId) throw new GApiError(404, 'Publication not found');
        const template: Template | undefined = await TemplateDao.readByIdStatic(pub.templateId)
        if (!template) throw new GApiError(404, 'Template not found for publication ' + code);

        return TemplateView.parseTemplate(template, pub)
    }

    // Get a list of published templates
    public static async publicationGetList(): Promise<PublishedTemplate[]> {
        const pubs: PublishedTemplate[] = await PublicationDao.list()
        return pubs
    }

    /**
     * Finds a user id by it's sha256
     * @param sha256 User sha256
     * @returns User Id or undefined if not found
     */
    public static async userShaToId(sha256: string): Promise<number | undefined> {
        return await UserDao.getIdFromHash(sha256)
    }
}
