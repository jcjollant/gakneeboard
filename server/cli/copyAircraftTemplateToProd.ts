import 'dotenv/config';
import { createPool } from '@vercel/postgres';

async function main() {
    const tailNumber = process.argv[2];
    if (!tailNumber) {
        console.error('Usage: tsx copyAircraftTemplateToProd.ts <tailNumber>');
        process.exit(1);
    }

    const testUrl = process.env.POSTGRES_TEST_URL;
    const prodUrl = process.env.POSTGRES_PROD_URL;

    if (!testUrl || !prodUrl) {
        console.error('Error: POSTGRES_TEST_URL and POSTGRES_PROD_URL must be set');
        process.exit(1);
    }

    const testPool = createPool({ connectionString: testUrl });
    const prodPool = createPool({ connectionString: prodUrl });

    try {
        console.log(`\x1b[32m[TEST]\x1b[0m Fetching template \x1b[1m${tailNumber}\x1b[0m...`);
        const { rows: testRows } = await testPool.query(
            'SELECT * FROM aircrafts WHERE tail_number = $1 AND user_id IS NULL',
            [tailNumber]
        );

        if (testRows.length === 0) {
            console.error(`\x1b[31m[Error]\x1b[0m Template ${tailNumber} not found in TEST database.`);
            process.exit(1);
        }

        const template = testRows[0];
        console.log(`\x1b[32m[TEST]\x1b[0m Found template (ID: ${template.id}).`);

        console.log(`\x1b[31m[PROD]\x1b[0m Upserting to PRODUCTION...`);
        // Note: We use the partial index for conflict resolution
        const { rows: prodRows } = await prodPool.query(
            `INSERT INTO aircrafts (user_id, tail_number, data, updated_at)
             VALUES (NULL, $1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (tail_number) WHERE user_id IS NULL
             DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [template.tail_number, template.data]
        );

        console.log(`\x1b[32m[Success]\x1b[0m Successfully copied \x1b[1m${tailNumber}\x1b[0m to PROD.`);
        console.log(`\x1b[32m[Success]\x1b[0m Prod record ID: ${prodRows[0].id}`);

    } catch (err) {
        console.error('\x1b[31m[Error]\x1b[0m', err);
    } finally {
        await testPool.end();
        await prodPool.end();
    }
}

main();
