import { Check, HealthCheck } from './HealthChecks'
import { Metrics, MetricKey } from '../backend/Metrics'
import { UserMiniView } from './models/UserMiniView';
import { Business } from './business/Business';
import { sql } from '@vercel/postgres';
import { UserDao } from './dao/UserDao';
import { Email, EmailType } from './Email';

export class Maintenance {
    code:string;
    static codeLogin:string = '12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146'
    static codeMetrics:string = 'd709064984df563c2d380045342e79902e32e769c11bd44c4a31c85ffa250992'
    static codeTest:string = '4d51414ceb16fe67ec67ef5194a76036fc54b59846c9e8da52841717fe4b6247'
    static codeHousekeeping = 'a4a474fbddd09c797707112a1c6f4f82b83a6e256ea562fb124739b3cdb888c4'
    static allCodes:string[] = [Maintenance.codeLogin, Maintenance.codeMetrics, Maintenance.codeTest, Maintenance.codeHousekeeping]

    constructor(code:string) {
        this.code = code
    }

    // find out if a code is valid or not
    isValidCode():boolean {
        return Maintenance.allCodes.includes(this.code)
    }

    async perform():Promise<string> {
        return new Promise<string>( async (res,rej) => {
            if(this.code == Maintenance.codeHousekeeping) { // This is Willie
                Maintenance.willie().then(res).catch(rej)
            } else if(this.code == Maintenance.codeLogin) { 
                const hash =  "357c3920bbfc6eefef7e014ca49ef12c78bb875c0826efe90194c9978303a8d3"
                UserMiniView.fromHash(hash).then( (umv:UserMiniView|undefined) => {
                    if(umv) {
                        res(JSON.stringify(umv))
                    } else {
                        rej('Invalid User')
                    }
                }).catch(e => {
                    rej(e)
                })
            } else if(this.code == Maintenance.codeMetrics) { // This is Waylon
                Maintenance.waylon().then(res).catch(rej)
            } else if(this.code == Maintenance.codeTest) {
                res( 'OK' )
            } else {
                rej( 'Invalid Code')
            }
        })
    }

    /**
     * Waylon performs metring
     */
     static async waylon(sendEmail:boolean=true, commit:boolean=true):Promise<string> {
        return Metrics.perform(false, false).then( async metrics => {
            const data:any = {}
            for(const metric of metrics) {
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
            const emailString = ['users=' + data[MetricKey.users],
                'feedbacks=' + data[MetricKey.feedbacks] ,
                'templates=' + data[MetricKey.templates] ,
                'pages=' + data[MetricKey.pagesTotal]].join(', ') + '\n'
            if(sendEmail) {
                // console.log('[Maintenance.waylon] sending email')
                await Email.send( emailString + dataString, EmailType.Metrics)
            } else {
                console.log('[Maintenance.waylon] skipping email')
            }
            if(commit) {
                await sql`INSERT INTO metrics (data) VALUES (${dataString})`;
            } else {
                console.log('[Maintenance.waylon] skipping commit')
            }
            return dataString
        })
    }

    /**
     * Willie perform chechs and routine maintenance
     */
    static async willie(sendEmail:boolean=true, persistRecord:boolean=true):Promise<string> {
        let failedChecks:number = 0
        let messages:string[] = []
        await Promise.all([
            HealthCheck.perform().then( async (allChecks) => {
                const data:string = JSON.stringify(allChecks)
                // console.log( '[HealthCheck.perform]', data, 'failures', failedChecks)
                failedChecks = allChecks.filter((check) => check.status === Check.FAIL).length
                messages.push('Found ' + failedChecks + ' fail(s)')
                messages.push(data)
                // save record
                if(persistRecord) {
                    await sql`INSERT INTO health_checks (data,failures) VALUES (${data},${failedChecks})`
                }
            }).catch(e => {
                throw e
            }),
            Business.printRefills(new UserDao()).then( r => {
                messages.push('Refilled ' + r.length + ' users')
            })])

        // cook email with business
        const output = messages.join('\n\n')
        if(sendEmail) {
            await Email.send(output, EmailType.Housekeeping)
        } else {
            console.log('[Maintenance.willie] not sending email \n' + output)
        }
        return output
    }
}