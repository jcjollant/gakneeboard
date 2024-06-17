import { sql } from "@vercel/postgres"

export class FeedbackDao {
    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM feedback`;
        return result.rows[0].count
    }

}