const { Client } = require('pg');
async function run() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL // Vercel postgres usually uses this
  });
  await client.connect();
  const res = await client.query("SELECT * FROM users WHERE account_type='beta' LIMIT 1;");
  console.log(res.rows[0].max_aircrafts);
  client.end();
}
run().catch(console.dir);
