import { sql } from "@vercel/postgres"
import { UserDao } from "./dao/UserDao";

export class FeedbackDao {
    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM feedback`;
        return result.rows[0].count
    }

    public static async save(version:string,feedback:string,user:string) {
        const userId = await UserDao.getIdFromHash(user)
        // console.log( '[FeedbackDao.save]', JSON.stringify(data), userId)
        await sql`INSERT INTO Feedback (Version,Text,user_id) VALUES (${version},${feedback},${userId})`;
    }

}