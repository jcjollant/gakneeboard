import { sql } from '@vercel/postgres';
 
export default async function handler(
  request,
  response,
) {
  try {
    const result =
    // await sql`DROP TABLE Airports;`;
    // await sql`CREATE TABLE Airports ( Code varchar(5), Data varchar(1024) );`;
    // await sql`SELECT column_name, data_type, character_maximum_length FROM information_schema. columns WHERE table_name = 'Airports';`
    // await sql`SELECT * FROM Airports;`
    await sql`SELECT count(*) FROM Airports;`

    // const code = 'KJFK';
    // await sql`SELECT * FROM Airports WHERE Code=${code};`
    // await sql`INSERT into Airports (Code, Data) VALUES(${code},${data})`
    // await sql`DELETE from Airports WHERE Code=${code}`
    console.log( 200 + " at " + Date.now())
    return response.status(200).json({ result });
  } catch (error) {
    console.log( 500 + " at " + Date.now())
    return response.status(500).json({ error });
  }
}