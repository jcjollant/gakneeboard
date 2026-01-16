import { db, sql } from "@vercel/postgres";

export class SkyvectorDao {

    public static async count(): Promise<number> {
        const result = await sql`SELECT count(*) FROM skyvector`;
        return Number(result.rows[0].count)
    }

    public static async countSince(days: number): Promise<number> {
        const client = await db.connect()
        const result = await client.query(`SELECT count(*) FROM skyvector WHERE create_time > (current_date - ${days})`);
        client.release()
        return Number(result.rows[0].count)
    }

    public static async save(code: string, data: any) {
        await sql`INSERT INTO skyvector (code, data) VALUES (${code}, ${data})`;
    }
}
