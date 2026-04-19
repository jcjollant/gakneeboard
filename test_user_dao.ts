import { sql, db } from '@vercel/postgres';
import { UserDao } from './server/backend/dao/UserDao';

async function main() {
    const dao = new UserDao();
    const result = await db.query(`SELECT * FROM users WHERE account_type = 'beta' LIMIT 1`);
    console.log("Raw row:", result.rows[0]);
    const user = dao.parseRow(result.rows[0]);
    console.log("Parsed User maxAircrafts:", user.maxAircrafts);
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
