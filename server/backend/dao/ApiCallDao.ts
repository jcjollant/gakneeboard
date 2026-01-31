import { db, sql } from "@vercel/postgres";

export enum ApiName {
    Nms = 'nms',
    Adip = 'adip',
    Skyvector = 'skyvector',
    Metar = 'metar'
}

export class ApiCallDao {

    public static async save(api: ApiName, code: string, dataLength: number, data?: any) {
        await sql`INSERT INTO api_calls (api, code, data_length, data) VALUES (${api}, ${code}, ${dataLength}, ${data})`;
    }

    public static async count(api: ApiName): Promise<number> {
        const result = await sql`SELECT count(*) FROM api_calls WHERE api = ${api}`;
        return Number(result.rows[0].count);
    }

    public static async countSinceByType(days: number): Promise<Record<string, number>> {
        const client = await db.connect();
        const result = await client.query(`
            SELECT api, count(*) 
            FROM api_calls 
            WHERE create_time > (current_date - ${days})
            GROUP BY api
        `);
        client.release();

        const counts: Record<string, number> = {};
        for (const row of result.rows) {
            counts[row.api] = Number(row.count);
        }
        // Initialize zeros for missing APIs if needed, or leave sparse.
        // Let's ensure all known APIs are present for consumer convenience?
        // Or leave it to consumer?
        // The implementation plan implies returning a map.
        return counts;
    }
}
