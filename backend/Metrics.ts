import { sql } from  "@vercel/postgres";
import { UserDao } from "./dao/UserDao"
import { FeedbackDao } from "./FeedbackDao"
import { AirportDao } from "./AirportDao";
import { PublicationDao } from './PublicationDao'
import { TemplateDao } from "./TemplateDao";
import { Template } from "./models/Template";
import { AdipDao } from "./adip/AdipDao";
import { PageType } from './TemplateTools'
import { UsageDao, UsageType } from "./dao/UsageDao";
import { UserTools } from './UserTools' 
import { Email, EmailType } from "./Email";
import { Adip } from "./adip/Adip";

export class Metric {
    name:string;
    value:number;

    constructor(metricName:string, value:number=0) {
        this.name = metricName;
        this.value = value;
    }

    public addOne() {
        this.value++;
    }
}

export class Metrics {
    static adipKey:string = 'adip'
    static airportsTotalKey:string = 'airports-total'
    static airportsValidKey:string = 'airports-valid'
    static airportsCurrentKey:string = 'airports-current'
    static usersKey:string = 'users'
    static usersGoogleKey:string = 'usersGoogle'
    static usersAppleKey:string = 'usersApple'
    static usersFacebookKey:string = 'usersFacebook'
    static sessionsKey:string = 'sessions'
    static sessions7Key:string = 'sessions-7d'
    static sessions14Key:string = 'sessions-14d'
    static sessions28Key:string = 'sessions-28d'
    static printsKey:string = 'prints'
    static exportsKey:string = 'exports'

    static async adip():Promise<Metric> {
        const adipCount = await AdipDao.count()
        return new Metric(this.adipKey, adipCount)
    }

    static async airports():Promise<Metric[]> {
        const all = await AirportDao.count()
        const output:Metric[] = []
        output.push( new Metric(this.airportsTotalKey, await AirportDao.count()))
        output.push( new Metric(this.airportsValidKey, await AirportDao.countValid()))
        output.push( new Metric(this.airportsCurrentKey, (await AirportDao.readCurrent(Adip.currentEffectiveDate)).length))
        return output
    }

    static async usage():Promise<Metric[]> {
        const counts = await UsageDao.countByType()
        const usageMetrics = counts.map( (count) => new Metric(Metrics.usageTypeToKey(count.type), count.count))

        usageMetrics.push( new Metric(this.sessions7Key, await UsageDao.countSessionsSince(7)))
        usageMetrics.push( new Metric(this.sessions14Key, await UsageDao.countSessionsSince(14)))
        usageMetrics.push( new Metric(this.sessions28Key, await UsageDao.countSessionsSince(28)))
        
        return usageMetrics
    }

    static usageTypeToKey(type:UsageType):string {
        switch(type) {
            case UsageType.Export: return this.exportsKey
            case UsageType.Print: return this.printsKey
            case UsageType.Session: return this.sessionsKey
        }
        // return '?'
    }

    static async users():Promise<Metric[]> {
        const userDao = new UserDao();

        const allMetrics:Metric[] = []

        const allUsers = await userDao.getAll()
        allMetrics.push(new Metric(this.usersKey, allUsers.length))
        // split by source
        const googleUsers = new Metric(this.usersGoogleKey)
        allMetrics.push(googleUsers)
        const appleUsers = new Metric(this.usersAppleKey)
        allMetrics.push(appleUsers)
        const facebookUsers = new Metric(this.usersFacebookKey)
        allMetrics.push(facebookUsers)

        for(const user of allUsers) {
            if(user.source == UserTools.google) {
                googleUsers.addOne()
            } else if( user.source == UserTools.apple) {
                appleUsers.addOne()
            } else if( user.source == UserTools.facebook) {
                facebookUsers.addOne()
            } else {
                console.log('Unknown source for user ', user.id)
            }
        }

        return allMetrics
    }

    static async feedbacks():Promise<Metric> {
        const feedbackCount:number = await FeedbackDao.count()
        return new Metric('feedbacks', feedbackCount)
    }

    static async templates():Promise<Metric> {
        const templateCount:number = await TemplateDao.count()
        return new Metric('templates', templateCount)
    }

    static async templateDetails():Promise<Metric[]> {
        const templates:Template[] = await TemplateDao.getAllTemplateData()

        // build a list of all metrics
        const allMetrics:Metric[] = []

        const totalPages = new Metric('totalPageCount', 0)
        allMetrics.push(totalPages)
        const tilePages = new Metric('tilePageCount', 0)
        allMetrics.push(tilePages)
        const checklistPages = new Metric('checklistPageCount', 0)
        allMetrics.push(checklistPages)
        const coverPages = new Metric('coverPageCount', 0)
        allMetrics.push(coverPages)
        const selectionPages = new Metric('selectionPageCount', 0)
        allMetrics.push(selectionPages)
        const navlogPages = new Metric('navlogPageCount', 0)
        allMetrics.push(navlogPages)
        const notesPages = new Metric('notesPageCount', 0)
        allMetrics.push(notesPages)
        const approachPages = new Metric('approachPageCount', 0)
        allMetrics.push(approachPages)

        const totalTileCount = new Metric('totalTileCount', 0)
        allMetrics.push(totalTileCount)
        const airportTileCount = new Metric('airportTileCount', 0)
        allMetrics.push(airportTileCount)
        const atisTileCount = new Metric('atisTileCount', 0)
        allMetrics.push(atisTileCount)
        const checklistTileCount = new Metric('checklistTileCount', 0)
        allMetrics.push(checklistTileCount)
        const clearanceTileCount = new Metric('clearanceTileCount', 0)
        allMetrics.push(clearanceTileCount)
        const fuelTileCount = new Metric('fuelTileCount', 0)
        allMetrics.push(fuelTileCount)
        const navlogTileCount = new Metric('navlogTileCount', 0)
        allMetrics.push(navlogTileCount)
        const notesTileCount = new Metric('notesTileCount', 0)
        allMetrics.push(notesTileCount)
        const radiosTileCount = new Metric('radiosTileCount', 0)
        allMetrics.push(radiosTileCount)
        const sunlightTileCount = new Metric('sunlightTileCount', 0)
        allMetrics.push(sunlightTileCount)

        const staleTemplateCount = new Metric('staleTemplateCount', 0)
        allMetrics.push(staleTemplateCount)

        for(let template of templates) {
            for(let page of template.data) {
                if(page.type == PageType.tiles) {
                    tilePages.addOne()
                    for(let tile of page.data) {
                        totalTileCount.addOne()
                        if(tile.name == 'airport') {
                            airportTileCount.addOne()
                        } else if(tile.name == 'atis') {
                            atisTileCount.addOne()
                        } else if(tile.name == 'checklist') {
                            checklistTileCount.addOne()
                        } else if(tile.name == 'clearance') {
                            clearanceTileCount.addOne()
                        } else if(tile.name == 'fuel') {
                            fuelTileCount.addOne()
                        } else if(tile.name == 'navlog') {
                            navlogTileCount.addOne()
                        } else if(tile.name == 'notes') {
                            notesTileCount.addOne()
                        } else if(tile.name == 'radios') {
                            radiosTileCount.addOne()
                        } else if(tile.name == 'sunlight') {
                            sunlightTileCount.addOne()
                        }
                    }
                } else if(page.type == PageType.checklist) {
                    checklistPages.addOne()
                } else if(page.type == PageType.cover) {
                    coverPages.addOne()
                } else if(page.type == PageType.selection) {
                    selectionPages.addOne()
                } else if(page.type == PageType.navLog) {
                    navlogPages.addOne()
                } else if(page.type == PageType.notes) {
                    notesPages.addOne()
                } else if(page.type == PageType.approach) {
                    approachPages.addOne()
                } else {
                    continue
                }
                totalPages.addOne()
            }
            // we assume that 12 data means stale
            if(template.data.length == 12) {
                staleTemplateCount.addOne()
            }
        }
        return allMetrics
    }

    static async publicationsCheck():Promise<Metric> {
        const publicationCount = await PublicationDao.count()
        return new Metric('publications', publicationCount)
    }

    /**
     * Sends an email with the outcome of all checks
     * This methods requires a password that seems to expire ona regular bas
     * @param data 
     * @returns 
     */
    static async sendMail(data:any):Promise<boolean> {
        const message = 'Here are ' + new Date().toDateString() + ' metrics\n\n' + data;
        return Email.send( message,EmailType.Metrics)
    }

    public static async perform(commit:boolean=true, sendMail:boolean=true):Promise<String> {
        return Promise.all([
                Metrics.users(),
                Metrics.feedbacks(),
                Metrics.templateDetails(),
                Metrics.usage(),
                Metrics.publicationsCheck(),
                Metrics.templates(),
                Metrics.airports(), 
                Metrics.adip()
            ]).then( async allMetrics => {
            const data:any = {}
            for(const metric of allMetrics) {
                // if we received an array, flatten it
                if( Array.isArray(metric)) {
                    for(const m of metric) {
                        data[m.name] = m.value
                    }
                } else {
                    data[metric.name] = metric.value
                }
            }
            const dataString:string = JSON.stringify(data)

            if(commit) {
                await sql`INSERT INTO metrics (data) VALUES (${dataString})`;
            } else {
                console.log( '[Metrics.perform] skipping commit')
            }
            if(sendMail) {
                console.log( '[Metrics.perform] sending email')
                await Metrics.sendMail( dataString)
            } else {
                console.log( '[Metrics.perform] skipping email')
            }
            return dataString
        })
    
    }
    
}
