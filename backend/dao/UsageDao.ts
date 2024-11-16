import { sql } from "@vercel/postgres";
import { Dao } from "./Dao";

export enum UsageType {
    Export = 'export',
    Print = 'print',
    Session = 'session'
}

export class UsageDao extends Dao {
    constructor() {
        super('usage')
    }

    public static async create(type:UsageType, userId:number|undefined=undefined, data:string|undefined=undefined):Promise<Boolean> {
        const dao = new UsageDao()
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
}