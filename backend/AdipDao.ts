import { sql } from  "@vercel/postgres";

export class AdipDao {
    
    public static async count():Promise<number> {
        const result = await sql`SELECT count(*) FROM Adip`;
        return Number(result.rows[0].count)
    }

    public static async save(code:string, data:any) {
        await sql`INSERT INTO Adip (Code, Data) VALUES (${code}, ${data})`;
    }
}