import { sql } from  "@vercel/postgres";
import { UserDao } from "./UserDao"
import { FeedbackDao } from "./FeedbackDao"
import { AirportDao } from "./AirportDao";
import { createTransport } from 'nodemailer'
import { PublicationDao } from './PublicationDao'
import { TemplateDao } from "./TemplateDao";
import { Template } from "./models/Template";
import { AdipDao } from "./AdipDao";


export class Metric {
    name:string;
    value:number;

    constructor(checkName:string, value:number) {
        this.name = checkName;
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

        const staleTemplateCount = new Metric('staleTemplateCount', 0)

        const totalPageCount = new Metric('totalPageCount', 0)
        const tilePageCount = new Metric('tilePageCount', 0)
        const checklistPageCount = new Metric('checklistPageCount', 0)
        const coverPageCount = new Metric('coverPageCount', 0)
        const selectionPageCount = new Metric('selectionPageCount', 0)
        const navlogPageCount = new Metric('navlogPageCount', 0)

        const totalTileCount = new Metric('totalTileCount', 0)
        const airportTileCount = new Metric('airportTileCount', 0)
        const atisTileCount = new Metric('atisTileCount', 0)
        const checklistTileCount = new Metric('checklistTileCount', 0)
        const clearanceTileCount = new Metric('clearanceTileCount', 0)
        const fuelTileCount = new Metric('fuelTileCount', 0)
        const navlogTileCount = new Metric('navlogTileCount', 0)
        const notesTileCount = new Metric('notesTileCount', 0)
        const radiosTileCount = new Metric('radiosTileCount', 0)
        const sunlightTileCount = new Metric('sunlightTileCount', 0)
        for(let template of templates) {
            for(let page of template.data) {
                if(page.type == 'tiles') {
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
                } else if(page.type == 'checklist') {
                    checklistPageCount.addOne()
                } else if(page.type == 'cover') {
                    coverPageCount.addOne()
                } else if(page.type == 'selection') {
                    selectionPageCount.addOne()
                } else if(page.type == 'navlog') {
                    navlogPageCount.addOne()
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
        // build a list of all metrics
        const allMetrics = [
            totalPageCount, tilePageCount, checklistPageCount, coverPageCount, selectionPageCount, navlogPageCount,
            totalTileCount, airportTileCount, atisTileCount, checklistTileCount, clearanceTileCount, fuelTileCount, notesTileCount, navlogTileCount, radiosTileCount, sunlightTileCount, 
            staleTemplateCount]
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
