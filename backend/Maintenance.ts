import { HealthCheck } from './HealthChecks'
import { Metrics } from '../backend/Metrics'
import { UserDao } from './UserDao';
import { User } from './models/User';
import { UserMiniView } from './models/UserMiniView';

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
            if(this.code == Maintenance.codeHousekeeping) {
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
            } else if(this.code == Maintenance.codeMetrics) {
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
}