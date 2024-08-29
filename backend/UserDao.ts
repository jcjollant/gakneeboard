import { sql } from '@vercel/postgres';
import { User } from './models/User'

export class UserDao {
    static modelVersion:number = 1;
    /**
     * Fetches a user by sha256 and return its Id
     * @param sha256 User sha256
     * @returns User Id
     */
    public static async getIdFromHash(sha256:string):Promise<number | undefined> {
        // console.log( '[UserDao] find user with sha256 ' + sha256)
        const result = await sql`SELECT id FROM users WHERE sha256=${sha256}`;
        // console.log( '[UserDao] found ' + result.rowCount + ' entries')
    
        if( result.rowCount == 0) return undefined

        // console.log( '[db] fetchAirportList found ' + JSON.stringify(result.rows[0]))
        return result.rows[0].id
    }

    // builds a user using the sha256 as a key
    public static async getUserFromHash(sha256:string):Promise<User | undefined> {
        const result = await sql`SELECT id,data FROM users WHERE sha256=${sha256}`;
        if( result.rowCount == 0) return undefined
        return User.fromJson(result.rows[0].id, sha256, result.rows[0].data)
    }

    /**
     * Saves a user to the database
     * @param user
     * @throws Error if sha256 is missing
     */

    public static async save(user:User):Promise<User> {
        // console.log( '[UserDao.save]  ' + JSON.stringify(user))
    
        if( !user.sha256) throw new Error('sha256 missing')
        const result = await sql`SELECT id from Users WHERE sha256 = ${user.sha256}`;
        // console.log( '[UserDao.save] match count ' + result.rowCount)
        if(result.rowCount == 0) {
            // console.log( '[UserDao.save] adding ' + user.sha256)
            const insert = await sql`INSERT INTO Users (sha256,data,version) VALUES (${user.sha256},${JSON.stringify(user)},${this.modelVersion}) RETURNING id`
            user.id = insert.rows[0].id
            // console.log( '[UserDao.save] ' + user.sha256)
        } else { // this user is known
            // console.log( '[UserDao.save] known user ' + user.sha256)
            user.id = result.rows[0].id
            await sql`UPDATE Users SET data = ${JSON.stringify(user)}, version=${this.modelVersion} WHERE id = ${user.id}`
        }
        return user
    }

    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM Users`;
        return Number(result.rows[0].count)
    }
}