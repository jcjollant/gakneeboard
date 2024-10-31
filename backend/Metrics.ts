import { sql } from  "@vercel/postgres";
import { UserDao } from "./UserDao"
import { FeedbackDao } from "./FeedbackDao"
import { AirportDao } from "./AirportDao";
import { createTransport } from 'nodemailer'
import { PublicationDao } from './PublicationDao'
import { TemplateDao } from "./TemplateDao";
import { Template } from "./models/Template";
import { AdipDao } from "./adip/AdipDao";
import { PageType } from './TemplateTools'
import { SessionDao } from "./dao/SessionDao";


export class Metric {
    name:string;
    value:number;

    constructor(metricName:string, value:number) {
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
    static sessionsKey:string = 'sessions'

    static async adip():Promise<Metric> {
        const adipCount = await AdipDao.count()
        return new Metric(this.adipKey, adipCount)
    }

    static async airports():Promise<Metric[]> {
        const all = await AirportDao.count()
        const output:Metric[] = []
        output.push( new Metric(this.airportsTotalKey, await AirportDao.count()))
        output.push( new Metric(this.airportsValidKey, await AirportDao.countValid()))
        output.push( new Metric(this.airportsCurrentKey, await AirportDao.countCurrent()))
        return output
    }

    static async sessions():Promise<Metric> {
        const count = await (new SessionDao()).count()
        return new Metric(this.sessionsKey, count)
    }

    static async users():Promise<Metric> {
        const usersCount = await UserDao.count()
        return new Metric(this.usersKey, usersCount)
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

        const totalPageCount = new Metric('totalPageCount', 0)
        allMetrics.push(totalPageCount)
        const tilePageCount = new Metric('tilePageCount', 0)
        allMetrics.push(tilePageCount)
        const checklistPageCount = new Metric('checklistPageCount', 0)
        allMetrics.push(checklistPageCount)
        const coverPageCount = new Metric('coverPageCount', 0)
        allMetrics.push(coverPageCount)
        const selectionPageCount = new Metric('selectionPageCount', 0)
        allMetrics.push(selectionPageCount)
        const navlogPageCount = new Metric('navlogPageCount', 0)
        allMetrics.push(navlogPageCount)
        const notesPageCount = new Metric('notesPageCount', 0)
        allMetrics.push(notesPageCount)

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
                    tilePageCount.addOne()
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
                    checklistPageCount.addOne()
                } else if(page.type == PageType.cover) {
                    coverPageCount.addOne()
                } else if(page.type == PageType.selection) {
                    selectionPageCount.addOne()
                } else if(page.type == PageType.navLog) {
                    navlogPageCount.addOne()
                } else if(page.type == PageType.notes) {
                    notesPageCount.addOne()
                } else {
                    continue
                }
                totalPageCount.addOne()
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
     * @param failedChecks 
     * @returns 
     */
    static async sendMail(data:any) {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
              user: 'jeancedric.jollant@gmail.com',
              pass: 'xzluolxqgtqlzzlh'
            }
          });

          const message = 'Here are ' + new Date().toDateString() + ' metrics\n\n' + data;

          const mailOptions = {
            from: 'Waylon <jeancedric.jollant@gmail.com>',
            to: 'jc@jollant.net',
            subject: 'Metrics',
            text: message
          };
          
          return new Promise( (resolve, reject) => {
            transporter.sendMail(mailOptions, function(error:any, info:any){
                if (error) {
                  console.log('[Metrics.sendMail]', error);
                  resolve(false)
                } else {
                  console.log('[Metrics.sendMail] Email sent:', info.response);
                  resolve(true)
                }
              });
          })

    }

    public static async perform(commit:boolean=true, sendMail:boolean=true):Promise<String> {
        return Promise.all([
                Metrics.users(),
                Metrics.feedbacks(),
                Metrics.templateDetails(),
                Metrics.sessions(),
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
