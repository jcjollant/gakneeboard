import { sql } from "@vercel/postgres"

export class FeedbackDao {
    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM feedback`;
        return result.rows[0].count
    }

    public static async save(data:any) {
        // console.log( '[FeedbackDao.save]')
        if( 'user' in data) {
            await sql`INSERT INTO Feedback (Version,Text,user256) VALUES (${data.version},${data.feedback},${data.user})`;
        } else {
            await sql`INSERT INTO Feedback (Version,Text) VALUES (${data.version},${data.feedback})`;
        }
    }

}