import { Metrics } from '../backend/Metrics'

export class Maintenance {
    code:string;
    static codeLogin:string = '12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146'
    static codeMetrics:string = 'd709064984df563c2d380045342e79902e32e769c11bd44c4a31c85ffa250992'

    constructor(code:string) {
        this.code = code;
    }

    public validCode():boolean {
        return this.code === Maintenance.codeLogin 
            || this.code === Maintenance.codeMetrics;
    }

    async perform():Promise<any> {
        return new Promise<any>((res,rej) => {
            if(this.code == Maintenance.codeLogin) {
                const user =  {"sha256":"357c3920bbfc6eefef7e014ca49ef12c78bb875c0826efe90194c9978303a8d3","name":"Jc","sheets":[]}
                res(user)
            } else if(this.code == Maintenance.codeMetrics) {
                Metrics.perform().then( () =>{
                    res( 'OK' )
                }).catch(e => {
                    rej(e)
                })
            } else {
                rej( 'Invalid Code')
            }
        })
    }
}