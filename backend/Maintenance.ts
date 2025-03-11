import { Check, HealthCheck } from './HealthChecks'
import { Metrics } from '../backend/Metrics'
import { UserMiniView } from './models/UserMiniView';
import { Business } from './business/Business';
import { sql } from '@vercel/postgres';
import { UserDao } from './dao/UserDao';
import { Email, EmailType } from './Email';
import { send } from 'process';

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

    async perform():Promise<any> {
        return new Promise<any>((res,rej) => {
            if(this.code == Maintenance.codeHousekeeping) { // This is Willie
            Maintenance.willie()
                HealthCheck.perform().then( (result) => {
                    res(result)
                }).catch(e => {
                    rej(e)
                })
            } else if(this.code == Maintenance.codeLogin) { 
                const hash =  "357c3920bbfc6eefef7e014ca49ef12c78bb875c0826efe90194c9978303a8d3"
                UserMiniView.fromHash(hash).then( (umv:UserMiniView|undefined) => {
                    if(umv) {
                        res(umv)
                    } else {
                        rej('Invalid User')
                    }
                }).catch(e => {
                    rej(e)
                })
            } else if(this.code == Maintenance.codeMetrics) { // This is Waylon
                Metrics.perform().then( () =>{
                    res( 'OK' )
                }).catch(e => {
                    rej(e)
                })
            } else if(this.code == Maintenance.codeTest) {
                res( 'OK' )
            } else {
                rej( 'Invalid Code')
            }
        })
    }

    static async willie(sendEmail:boolean=true, persistRecord:boolean=true) {
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
                return e
            }),
            Business.printRefills(new UserDao()).then( r => {
                messages.push('Refilled ' + r.length + ' users')
            })])

        // cook email with business
        if(sendEmail) {
            await Email.send(messages.join('\n\n'), EmailType.Housekeeping)
        } else {
            console.log('[Maintenance.willie] not sending email \n' + messages.join('\n\n'))
        }
    }
}