import { sql } from "@vercel/postgres";
import { Dao } from "./Dao";

export class SessionDao extends Dao {
    constructor() {
        super('sessions')
    }

    public static async create(userId:number):Promise<Boolean> {
        const dao = new SessionDao()
        return new Promise<Boolean>(async (resolve, reject) => {
            // console.log('[SessionDao.create] userId', userId)
            sql`INSERT INTO sessions (user_id) VALUES (${userId})`
                .then( () => {
                    // console.log('[SessionDao.create] success')
                    resolve(true)
                })
                .catch( err => reject(err))
        })
    }
}