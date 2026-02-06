
import 'dotenv/config';

function checkDbEnvironment() {
    const postgresUrl = process.env.POSTGRES_URL;
    const postgresProdUrl = process.env.POSTGRES_PROD_URL;

    if (!postgresUrl) {
        console.log('\x1b[33m[Warning] POSTGRES_URL is not set.\x1b[0m');
        return;
    }

    const isProd = postgresProdUrl && postgresUrl === postgresProdUrl;

    // Red for Prod, Green for Test
    // Red for Prod, Green for Test
    const color = isProd ? '\x1b[31m' : '\x1b[32m'; // 31 is Red, 32 is Green
    const dbName = isProd ? 'PRODUCTION' : 'TEST';

    // Only color the value, not the label, to avoid terminal rendering issues
    console.log(`Current Database Environment: ${color}${dbName} \x1b[0m`);
}

checkDbEnvironment();
