
import dotenv from 'dotenv'
dotenv.config()

//===============================================================================
// Update all airports that do not have a sketch, with version 15 and are current
import { sql } from "@vercel/postgres";
import { AirportSketch } from "../backend/AirportSketch";
import { AirportDao } from "../backend/AirportDao";
import * as fs from 'fs';

const cycle = '2512'

// declare and execute
async function doIt() {
    const args = process.argv.slice(2);
    if (args.length >= 2) {
        const airportCode = args[0];
        const filePath = args[1];
        console.log(`Manual update for ${airportCode} from ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }

        const buffer = fs.readFileSync(filePath);
        try {
            const url = await AirportSketch.save(airportCode, buffer);
            console.log(`Successfully uploaded sketch for ${airportCode}: ${url}`);
        } catch (error) {
            console.error(`Failed to upload sketch for ${airportCode}`, error);
        }
        return;
    }

    let updated = 0;
    const response = await sql`select * from airports where sketch ISNULL and version != -1`
    // const response = await sql`SELECT * FROM airports where sketch isnull and version=15`
    console.log('found rows', response.rowCount)
    await new Promise(resolve => setTimeout(resolve, 2000))
    for (const row of response.rows) {
        const airport = AirportDao.parse(row)
        try {
            airport.code = row.code
            console.log('Getting', airport.code)

            if (!airport.iap || airport.iap.length < 1) {
                await AirportSketch.resolve(airport)
                continue;
            }
            const before = airport.iap[0].pdf
            const iap = before.split('/')[1]
            airport.iap[0].pdf = cycle + '/' + iap
            console.log('airport', airport.code, 'before', before, 'after', airport.iap[0].pdf)
            await AirportSketch.resolve(airport)
            updated++;
            // wait random time between 1 and 5 seconds
            const time = Math.floor(Math.random() * 4000) + 3000
            console.log('updated', updated, 'out of', response.rowCount)
            console.log('Waiting', time, 'ms')
            await new Promise(resolve => setTimeout(resolve, time))
        } catch (err) {
            console.log("failed to process ", row.code)
        }
    }
}
doIt().then(() => {
    console.log('done')
})
