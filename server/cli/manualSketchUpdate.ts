
import dotenv from 'dotenv'
dotenv.config()

if (process.env.POSTGRES_PROD_URL) {
    console.log('Using Production Database')
    process.env.POSTGRES_URL = process.env.POSTGRES_PROD_URL
}

//===============================================================================
// Update all airports that do not have a sketch, with version 15 and are current
import * as fs from 'fs';

const cycle = process.env.AERONAV_DATA_CYCLE

// declare and execute
async function doIt() {
    const { AirportSketch } = await import("../backend/AirportSketch.js");
    const { AirportDao } = await import("../backend/AirportDao.js");
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

    if (args.length === 1) {
        const airportCode = args[0];
        console.log(`Manual fetch (dry-run) for ${airportCode}`);

        const { known } = await AirportDao.codesLookup([airportCode]);
        if (known.length === 0) {
            console.error(`Airport not found: ${airportCode}`);
            return;
        }

        const airport = known[0].airport;
        if (!airport.iap || airport.iap.length === 0) {
            console.log(`No IAP for ${airportCode}`);
            return;
        }

        const pdf = airport.iap[0].pdf;
        await AirportSketch.get(airportCode, pdf, true);
        return;
    }

    let updated = 0;
    const airports = await AirportDao.readMissingSketch(1000)
    console.log('found rows', airports.length)
    await new Promise(resolve => setTimeout(resolve, 2000))
    for (const airport of airports) {
        try {
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
            console.log('updated', updated, 'out of', airports.length)
            console.log('Waiting', time, 'ms')
            await new Promise(resolve => setTimeout(resolve, time))
        } catch (err) {
            console.log("failed to process ", airport.code)
        }
    }
}
doIt().then(() => {
    console.log('done')
})
