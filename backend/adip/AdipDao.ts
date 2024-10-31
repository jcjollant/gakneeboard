import { sql } from  "@vercel/postgres";
import { Adip } from "./Adip";

export class AdipDao {

    public static async cleanUpStaleData():Promise<number> {
        const result = await sql`UPDATE adip SET data=NULL WHERE code in (SELECT DISTINCT code FROM adip WHERE create_time > ${Adip.currentEffectiveDate}) AND create_time < ${Adip.currentEffectiveDate} AND data NOTNULL`
        return Promise.resolve(result.rowCount)
    }

    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM Adip`;
        return Number(result.rows[0].count)
    }

    public static async save(code:string, data:any) {
        await sql`INSERT INTO Adip (code, data) VALUES (${code}, ${data})`;
    }
}