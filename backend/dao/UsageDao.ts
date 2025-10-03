import { db, sql, VercelPoolClient } from "@vercel/postgres";
import { Dao } from "./Dao";
import { Usage } from "../models/Usage";
import { UsageCount } from "../models/UsageCount";

export enum UsageType {
    Eula = 'eula',
    Export = 'export',
    Print = 'print',
    Refill = 'refill',
    Save = 'save',
    Session = 'session'
}

export class UsageByType {
    type:UsageType = UsageType.Session
    count:number = 0
}

export class UsageDao extends Dao<Usage> {
    protected tableName: string = 'usage';


    public static async create(type:UsageType, userId:number|undefined=undefined, data:string|undefined=undefined):Promise<Boolean> {
        // const dao = new UsageDao()
        return new Promise<Boolean>(async (resolve, reject) => {
            sql`INSERT INTO usage (user_id, data, usage_type) VALUES (${userId}, ${data},${type})`
                .then( () => {
                    // console.log('[UsageDao.create] success')
                    resolve(true)
                })
                .catch( err => {
                    console.log('[UsageDao.create] error', err, type)
                    reject(err)
                })
        })
    }

    public async countByType():Promise<UsageByType[]> {
        return new Promise<UsageByType[]>(async (resolve, reject) => {
            this.db.query(`SELECT ${this.tableName}, COUNT(*) FROM usage GROUP BY usage_type`)
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
    public async countTypeSince(type:string, days:number) {
        return new Promise<number>(async (resolve, reject) => {
            this.db.query(`SELECT COUNT(*) FROM ${this.tableName} WHERE usage_type='${type}' AND create_time > (current_date - ${days})`)
            // client.query("SELECT user_id FROM usage WHERE user_id NOTNULL AND usage_type='session' AND create_time > current_date - " + days + " GROUP BY user_id")
                .then( res => {
                    // resolve with the returned count
                    if(res.rows.length == 0) resolve(0)
                    else resolve(Number(res.rows[0].count))
                })
                .catch( err => reject(err))
        })
    }

    public async countTypeByUserSince(type:string, days:number):Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            this.db.query(`SELECT user_id FROM ${this.tableName} WHERE user_id NOTNULL AND usage_type='${type}' AND create_time > current_date - ${days} GROUP BY user_id`)
            // client.query("SELECT user_id FROM usage WHERE user_id NOTNULL AND usage_type='session' AND create_time > current_date - " + days + " GROUP BY user_id")
                .then( res => {
                    resolve(Number(res.rows.length))
                })
                .catch( err => reject(err))
        })
    }

    public async getTypeSince(type:string, days:number):Promise<Usage[]> {
        return new Promise<Usage[]>(async (resolve, reject) => {
            this.db.query(`SELECT * FROM usage WHERE usage_type='${type}' AND create_time > current_date - ${days}`)
                .then( res => {
                    const output = res.rows.map( this.parseRow)
                    resolve(output)
                })
                .catch( err => reject(err))
        })
    }

    public parseRow(row:any):Usage {
        // console.log('[UserDao.parseRow]', id, sha256, accountType)
        const usage = new Usage(row.user_id, row.data, row.usage_type)

        return usage
    }

    static async refill(userId: number, previousCount: number, newCount: number) {
        const data = {from: previousCount, to: newCount}
        await UsageDao.create(UsageType.Refill, userId, JSON.stringify(data))
    }

    public async userUsageCountSince(userId:number, days:number):Promise<UsageCount[]> {
        return new Promise<UsageCount[]>(async (resolve, reject) => {
            this.db.query(`SELECT usage_type, COUNT(*) FROM ${this.tableName} WHERE user_id=${userId} AND create_time > current_date - ${days} GROUP BY usage_type`)
                .then( res => {
                    const output = res.rows.map( countRow => {
                        return new UsageCount(countRow.usage_type, countRow.count)
                    })
                    resolve(output)
                })
                .catch( err => reject(err))
        })
    }
}