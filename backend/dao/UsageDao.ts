import { db, sql } from "@vercel/postgres";
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

    /**
     * Count the numebr of sessions since the given number of days, 
     * @param days 
     * @returns 
     */
    public static async countTypeSince(type:string, days:number) {
        return new Promise<number>(async (resolve, reject) => {
            const client = await db.connect()
            client.query(`SELECT COUNT(*) FROM usage WHERE usage_type='${type}' AND create_time > current_date - ${days} GROUP BY user_id`)
            // client.query("SELECT user_id FROM usage WHERE user_id NOTNULL AND usage_type='session' AND create_time > current_date - " + days + " GROUP BY user_id")
                .then( res => {
                    // resolve with the returned count
                    if(res.rows.length == 0) resolve(0)
                    else resolve(Number(res.rows[0].count))
                    client.release()
                })
                .catch( err => reject(err))
        })
    }

    public static async countTypeByUserSince(type:string, days:number) {
        return new Promise<number>(async (resolve, reject) => {
            const client = await db.connect()
            client.query(`SELECT user_id FROM usage WHERE user_id NOTNULL AND usage_type='${type}' AND create_time > current_date - ${days} GROUP BY user_id`)
            // client.query("SELECT user_id FROM usage WHERE user_id NOTNULL AND usage_type='session' AND create_time > current_date - " + days + " GROUP BY user_id")
                .then( res => {
                    resolve(Number(res.rows.length))
                    client.release()
                })
                .catch( err => reject(err))
        })
    }
}