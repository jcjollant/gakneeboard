import { sql } from "@vercel/postgres";
import { Dao } from "./Dao";

export class PrintDao extends Dao {
    constructor() {
        super('prints')
    }

    public static async create(userId:number|undefined, data:string):Promise<Boolean> {
        const dao = new PrintDao()
        return new Promise<Boolean>(async (resolve, reject) => {
            sql`INSERT INTO prints (user_id, data) VALUES (${userId}, ${data})`
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