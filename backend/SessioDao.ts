import { sql } from "@vercel/postgres";
import { User } from "./models/User";

export class SessionDao {
    public static async create(userId:number):Promise<Boolean> {
        return new Promise<Boolean>(async (resolve, reject) => {
            // console.log('[SessionDao.create] userId', userId)
            sql`INSERT INTO Sessions (user_id) VALUES (${userId})`
                .then( () => {
                    // console.log('[SessionDao.create] success')
                    resolve(true)
                })
                .catch( err => reject(err))
        })
    }
}