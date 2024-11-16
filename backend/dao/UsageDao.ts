import { sql } from "@vercel/postgres";
import { Dao } from "./Dao";

export enum UsageType {
    Export = 'export',
    Print = 'print',
    Session = 'session'
}

export class UsageByType {
    type:UsageType = UsageType.Session
    count:number = 0
}

export class UsageDao extends Dao {
    constructor() {
        super('usage')
    }

    public static async create(type:UsageType, userId:number|undefined=undefined, data:string|undefined=undefined):Promise<Boolean> {
        // const dao = new UsageDao()
        return new Promise<Boolean>(async (resolve, reject) => {
            sql`INSERT INTO usage (user_id, data, usage_type) VALUES (${userId}, ${data},${type})`
                .then( () => {
                    // console.log('[PrintDao.create] success')
                    resolve(true)
                })
                .catch( err => {
                    console.log('[PrintDao.create] error', err)
                    reject(err)
                })
        })
    }

    public static async countByType():Promise<UsageByType[]> {
        return new Promise<UsageByType[]>(async (resolve, reject) => {
            sql`SELECT usage_type,COUNT(*) FROM usage GROUP BY usage_type`
                .then( res => {
                    const output:UsageByType[] = []
                    for( const row of res.rows) {
                        if(row.usage_type == undefined) continue
                        output.push({type:row.usage_type as UsageType, count:Number(row.count)})
                    }
                    resolve(output)
                })
                .catch( err => reject(err))
        })
    }
}