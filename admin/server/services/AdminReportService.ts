import { sql } from "@vercel/postgres";

export class AdminReportService {
    /**
     * Get users with account type 'sim' who have printed since the given start date.
     * @param startDate 
     * @returns List of users with their print count
     */
    public static async getLowHangingFruits(startDate: Date): Promise<{ userId: number, email: string, count: number }[]> {
        return new Promise<{ userId: number, email: string, count: number }[]>(async (resolve, reject) => {
            const query = `
                SELECT 
                    u.id, 
                    (u.data::json)->>'email' as email, 
                    COUNT(us.id) as count
                FROM users u
                JOIN usage us ON u.id = us.user_id
                WHERE u.account_type = 'sim'
                  AND us.usage_type = 'print'
                  AND us.create_time >= $1
                GROUP BY u.id, (u.data::json)->>'email'
                ORDER BY count DESC
            `;
            try {
                const res = await sql.query(query, [startDate])
                const output = res.rows.map(row => ({
                    userId: Number(row.id),
                    email: row.email || '?',
                    count: Number(row.count)
                }))
                resolve(output)
            } catch (err) {
                console.error('[AdminReportService.getLowHangingFruits] error', err)
                reject(err)
            }
        })
    }
}
