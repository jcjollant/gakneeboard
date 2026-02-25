
import dotenv from 'dotenv'
dotenv.config()

import { AdipService } from '../backend/services/AdipService'

(async () => {
    console.log("Fetching current FAA cycle info from ADIP...")
    try {
        const info = await AdipService.fetchCurrentCycleInfo()
        console.log("--- ADIP Cycle Info ---")
        console.log(`Cycle:          ${info.cycle}`)
        console.log(`Effective Date: ${info.effectiveDate}`)
    } catch (e: any) {
        console.error("Error fetching ADIP cycle info:", e.message || e)
    } finally {
        process.exit(0)
    }
})()
