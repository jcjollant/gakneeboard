import dotenv from 'dotenv'
dotenv.config()

// Default to the production database
process.env.POSTGRES_URL = process.env.POSTGRES_PROD_URL
console.log('Using PRODUCTION database')

import { Metrics } from '../backend/maintenance/Metrics'

async function run() {
    console.log("Analyzing top airports across templates...");
    try {
        await Metrics.topAirports();
        console.log("Done.");
    } catch (err) {
        console.error("Error analyzing top airports:", err);
    }
    process.exit(0);
}

run();
