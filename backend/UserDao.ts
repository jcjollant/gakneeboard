import postgres from '@vercel/postgres';

export class UserDao {
    /**
     * Fetches a user by sha256 and return its Id
     * @param sha256 User sha256
     * @returns User Id
     */
    public static async find(sha256:string):Promise<number | undefined> {
        const result = await postgres.sql`SELECT Id FROM Users WHERE sha256 = (${sha256})`;
        // console.log( '[db] fetchAirportList found ' + result.rowCount + ' entries')
        // console.log( '[db] fetchAirportList result ' + JSON.stringify(result))
    
        if( result.rowCount == 0) return undefined

        return result.rows[0].data["Id"]
    }
}