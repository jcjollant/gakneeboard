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
import { UserTemplateData } from "./models/UserTemplateData";
import { UserUsage } from "./models/UserUsage";

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

enum Key {
    adip = 'adip',
    airportsTotal = 'airports-total',
    airportsValid = 'airports-valid',
    airportsCurrent = 'airports-current',
    exports = 'exports',
    export7 = 'exports-7d',
    export28 = 'exports-28d',
    feedbacks = 'feedbacks',
    pageApproach = 'approachPageCount',
    pageDiagram = 'diagramPageCount',
    pageChecklist = 'checklistPageCount',
    pageCover = 'coverPageCount',
    pageNavlog = 'navlogPageCount',
    pageNotes = 'notesPageCount',
    pageSelection = 'selectionPageCount',
    pageStrip = 'stripPageCount',
    pageTiles = 'tilePageCount',
    pagesTotal = 'totalPageCount',
    prints = 'prints',
    print7 = 'prints-7d',
    print28 = 'prints-28d',
    sessions = 'sessions',
    sessions7 = 'sessions-7d',
    sessions14 = 'sessions-14d',
    sessions28 = 'sessions-28d',
    templates = 'templates',
    templatesStale = 'staleTemplateCount',
    tileAirport = 'airportTileCount',
    tileAtis = 'atisTileCount',
    tileChecklist = 'checklistTileCount',
    tileClearance = 'clearanceTileCount',
    tileFuel = 'fuelTileCount',
    tileNavlog = 'navlogTileCount',
    tileNotes = 'notesTileCount',
    tileRadios = 'radiosTileCount',
    tileSunlight = 'sunlightTileCount',
    tilesTotal = 'totalTileCount',
    users = 'users',
    usersGoogle = 'usersGoogle',
    usersApple = 'usersApple',
    usersFacebook = 'usersFacebook',
    userCat0 = 'cat-0',
    userCat1 = 'cat-1-4',
    userCat5 = 'cat-5-19',
    userCat20 = 'cat-20',
}

export class Metrics {

    static async adip():Promise<Metric> {
        const adipCount = await AdipDao.count()
        return new Metric(Key.adip, adipCount)
    }

    static async airports():Promise<Metric[]> {
        const all = await AirportDao.count()
        const output:Metric[] = []
        output.push( new Metric(Key.airportsTotal, await AirportDao.count()))
        output.push( new Metric(Key.airportsValid, await AirportDao.countValid()))
        output.push( new Metric(Key.airportsCurrent, (await AirportDao.readCurrent(Adip.currentEffectiveDate)).length))
        return output
    }

    static async usage():Promise<Metric[]> {
        const usageMetrics:Metric[] = []
        usageMetrics.push( new Metric(Key.export7, await UsageDao.countTypeByUserSince(UsageType.Export, 7)))
        usageMetrics.push( new Metric(Key.export28, await UsageDao.countTypeByUserSince(UsageType.Export, 28)))
        usageMetrics.push( new Metric(Key.print7, await UsageDao.countTypeSince(UsageType.Print, 7)))
        usageMetrics.push( new Metric(Key.print28, await UsageDao.countTypeSince(UsageType.Print, 28)))
        usageMetrics.push( new Metric(Key.sessions7, await UsageDao.countTypeByUserSince(UsageType.Session, 7)))
        usageMetrics.push( new Metric(Key.sessions28, await UsageDao.countTypeByUserSince(UsageType.Session, 28)))
        
        return usageMetrics
    }

    static usageTypeToKey(type:UsageType):string {
        switch(type) {
            case UsageType.Export: return Key.exports
            case UsageType.Print: return Key.prints
            case UsageType.Session: return Key.sessions
        }
        // return '?'
    }

    static async users():Promise<Metric[]> {
        const userDao = new UserDao();

        const allMetrics:Metric[] = []

        const allUsers = await userDao.getAll()
        allMetrics.push(new Metric(Key.users, allUsers.length))
        // split by source
        const googleUsers = new Metric(Key.usersGoogle)
        allMetrics.push(googleUsers)
        const appleUsers = new Metric(Key.usersApple)
        allMetrics.push(appleUsers)
        const facebookUsers = new Metric(Key.usersFacebook)
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
        return new Metric(Key.feedbacks, feedbackCount)
    }

    static async templates():Promise<Metric> {
        const templateCount:number = await TemplateDao.count()
        return new Metric(Key.templates, templateCount)
    }

    static async templateDetails():Promise<Metric[]> {
        const templates:Template[] = await TemplateDao.getAllTemplateData()

        // build a list of all metrics
        const metricsKeys:Key[] = [Key.pagesTotal, Key.pageTiles, Key.pageChecklist, Key.pageStrip, Key.pageCover, Key.pageSelection, Key.pageNavlog, Key.pageNotes, Key.pageApproach, Key.pageDiagram,
            Key.tilesTotal, Key.tileAirport, Key.tileAtis, Key.tileChecklist, Key.tileClearance, Key.tileFuel, Key.tileNavlog, Key.tileNotes, Key.tileRadios, Key.tileSunlight, Key.templatesStale]
        // populate the dictionary with metrics
        const ml:{[key:string]:Metric} = {}
        for(const key of metricsKeys) ml[key] = new Metric(key)

        for(let template of templates) {
            for(let page of template.data) {
                if(page.type == PageType.tiles) {
                    ml[Key.pageTiles].addOne()
                    for(let tile of page.data) {
                        ml[Key.tilesTotal].addOne()
                        if(tile.name == 'airport') {
                            ml[Key.tileAirport].addOne()
                        } else if(tile.name == 'atis') {
                            ml[Key.tileAtis].addOne()
                        } else if(tile.name == 'checklist') {
                            ml[Key.tileChecklist].addOne()
                        } else if(tile.name == 'clearance') {
                            ml[Key.tileClearance].addOne()
                        } else if(tile.name == 'fuel') {
                            ml[Key.tileFuel].addOne()
                        } else if(tile.name == 'navlog') {
                            ml[Key.tileNavlog].addOne()
                        } else if(tile.name == 'notes') {
                            ml[Key.tileNotes].addOne()
                        } else if(tile.name == 'radios') {
                            ml[Key.tileRadios].addOne()
                        } else if(tile.name == 'sunlight') {
                            ml[Key.tileSunlight].addOne()
                        }
                    }
                } else if(page.type == PageType.checklist) {
                    ml[Key.pageChecklist].addOne()
                } else if(page.type == PageType.strips) {
                    ml[Key.pageStrip].addOne()
                } else if(page.type == PageType.cover) {
                    ml[Key.pageCover].addOne()
                } else if(page.type == PageType.selection) {
                    ml[Key.pageSelection].addOne()
                } else if(page.type == PageType.navLog) {
                    ml[Key.pageNavlog].addOne()
                } else if(page.type == PageType.notes) {
                    ml[Key.pageNotes].addOne()
                } else if(page.type == PageType.approach) {
                    ml[Key.pageApproach].addOne()
                } else if(page.type == PageType.diagram) {
                    ml[Key.pageDiagram].addOne()
                } else {
                    continue
                }
                ml[Key.pagesTotal].addOne()
            }
            // we assume that 12 data means stale
            if(template.data.length == 12) {
                ml[Key.templatesStale].addOne()
            }
        }
        return metricsKeys.map( (mk:string) => ml[mk])
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

    public static async pagePerUser():Promise<Map<number,UserUsage>> {
        const result:UserTemplateData[] = await TemplateDao.getTemplateDataByUser()
        // console.log( 'templates count', result.length)
        return result.reduce( (acc, utd) => {
            // console.log( entry.id, entry.pages)
            // console.log( utd.userId, templateData.length)
            const usage = acc.get(utd.userId) || new UserUsage()
            usage.addTemplate(utd.pages)
            acc.set(utd.userId, usage)
            // console.log(entry.id, value)
            return acc
        }, new Map<number,UserUsage>())
    }

    static async usersPerAccountCategory():Promise<Metric[]> {
        const output = new Promise<Metric[]>( (resolve, reject) => {
            Metrics.pagePerUser().then(  async usage => {
                const cat0 = new Metric(Key.userCat0)
                const cat1 = new Metric(Key.userCat1)
                const cat5 = new Metric(Key.userCat5)
                const cat20 = new Metric(Key.userCat20)
                // reduce UserUsage map to individual metric
                usage.forEach( (value:UserUsage, key:number) => {
                    if(value.pages == 0) {
                        cat0.addOne()
                    } else if(value.pages < 5) {
                        cat1.addOne()
                    } else if(value.pages < 20) {
                        cat5.addOne()
                    } else {
                        cat20.addOne()
                    }
                })
                if(cat0.value == 0) {
                    const userCount = await new UserDao().count();
                    cat0.value = userCount - cat1.value - cat5.value - cat20.value;
                }
                resolve([cat0, cat1, cat5, cat20])
            })
        })
        return output
    }

    public static async perform(commit:boolean=true, sendMail:boolean=true):Promise<String> {
        return Promise.all([
                Metrics.users(),
                Metrics.feedbacks(),
                Metrics.templateDetails(),
                Metrics.usage(),
                Metrics.usersPerAccountCategory(),
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
                const emailString = 'users=' + data[Key.users] + ', feedbacks=' + data[Key.feedbacks] + ', pages=' + data[Key.pagesTotal] + '\n'
                await Metrics.sendMail( emailString + dataString)
            } else {
                console.log( '[Metrics.perform] skipping email')
            }
            return dataString
        })
    
    }
    
}
