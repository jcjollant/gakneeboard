import { db, sql } from "@vercel/postgres";
import { AdipService } from "../services/AdipService";

export class AdipDao {

    public static async cleanUpStaleData(): Promise<number> {
        const effectiveDate = AdipService.currentEffectiveDate()
        const result = await sql`UPDATE adip SET data=NULL WHERE code in (SELECT DISTINCT code FROM adip WHERE create_time > ${effectiveDate}) AND create_time < ${effectiveDate} AND data NOTNULL`
        return Promise.resolve(result.rowCount)
    }

    public static async count(): Promise<number> {
        const result = await sql`SELECT count(*) FROM Adip`;
        return Number(result.rows[0].count)
    }

    public static async countSince(days: number): Promise<number> {
        const client = await db.connect()
        const result = await client.query(`SELECT count(*) FROM adip WHERE create_time > (current_date - ${days})`);
        client.release()
        return Number(result.rows[0].count)
    }

    public static async save(code: string, data: any) {
        await sql`INSERT INTO Adip (code, data) VALUES (${code}, ${data})`;
    }
}