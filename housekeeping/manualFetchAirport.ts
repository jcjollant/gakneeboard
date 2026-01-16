import dotenv from 'dotenv'
dotenv.config()

import { AirportService } from '../backend/services/AirportService'

const code = process.argv[2]

if (!code) {
    console.log("Usage: npx ts-node housekeeping/manualFetchAirport.ts <CODE>")
    process.exit(1)
}

(async () => {
    console.log(`Fetching ${code}...`)
    try {
        const results = await AirportService.getAirports([code])
        for (const result of results) {
            if (result.airport) {
                console.log(JSON.stringify(result.airport, null, 2))
                console.log(`Source: ${result.airport.source}`)
            } else {
                console.log(`[${result.code}] Not Found or Unknown`)
            }
        }
    } catch (e) {
        console.error("Error fetching airport:", e)
    } finally {
        console.log("Done.")
        process.exit(0)
    }
})()
