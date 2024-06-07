import { sql } from '@vercel/postgres';

export class UserDao {
    /**
     * Fetches a user by sha256 and return its Id
     * @param sha256 User sha256
     * @returns User Id
     */
    public static async find(sha256:string):Promise<number | undefined> {
        // console.log( '[UserDao] find user with sha256 ' + sha256)
        const result = await sql`SELECT id FROM users WHERE sha256=${sha256}`;
        // console.log( '[UserDao] found ' + result.rowCount + ' entries')
    
        if( result.rowCount == 0) return undefined

        // console.log( '[db] fetchAirportList found ' + JSON.stringify(result.rows[0]))
        return result.rows[0].id
    }
}