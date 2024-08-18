import { sql } from  "@vercel/postgres";
import { Airport } from "./models/Airport";
import { Adip } from './Adip'
import { UserDao } from "./UserDao"
import { FeedbackDao } from "./FeedbackDao"
import { AirportDao } from "./AirportDao";
import { createTransport } from 'nodemailer'
import { PublicationDao } from './PublicationDao'
import { SheetDao } from "./SheetDao";


export class Metric {
    name:string;
    value:number;

    constructor(checkName:string, value:number) {
        this.name = checkName;
        this.value = value;
    }
}

export class Metrics {

    static async airports():Promise<Metric> {
        const airportCount = await AirportDao.count()
        return new Metric('airports', airportCount)
    }

    static async users():Promise<Metric> {
        const usersCount = await UserDao.count()
        return new Metric('users', usersCount)
    }

    static async feedbacks():Promise<Metric> {
        const feedbackCount:number = await FeedbackDao.count()
        return new Metric('feedbacks', feedbackCount)
    }

    static async sheets():Promise<Metric> {
        const sheetsCount:number = await SheetDao.count()
        return new Metric('sheets', sheetsCount)
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

    public static async perform():Promise<Metric[]> {
        return Promise.all([
                Metrics.airports(), 
                Metrics.feedbacks(),
                Metrics.publicationsCheck(),
                Metrics.sheets(),
                Metrics.users()
            ]).then( async allMetrics => {
            const data:any = {}
            for(const metric of allMetrics) {
                data[metric.name] = metric.value
            }
            const dataString:string = JSON.stringify(data)

            await sql`INSERT INTO metrics (data) VALUES (${dataString})`;
    
            console.log( '[Metrics.perform] sending email')
            await Metrics.sendMail( dataString)
            return allMetrics
        })
    
    }
    
}
