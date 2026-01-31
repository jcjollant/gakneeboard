
import dotenv from 'dotenv'
dotenv.config()

import { WeatherService, MetarParams } from '../backend/services/WeatherService'

const code = process.argv[2]
const formatArg = process.argv[3]

if (!code) {
    console.log("Usage: npx ts-node housekeeping/manualFetchMetar.ts <CODE> [FORMAT]")
    console.log("Formats: raw, decoded, json, geojson, xml, iwxxm (default: json)")
    process.exit(1)
}

let format: 'raw' | 'decoded' | 'json' | 'geojson' | 'xml' | 'iwxxm' = 'json';
const validFormats = ['raw', 'decoded', 'json', 'geojson', 'xml', 'iwxxm'];

if (formatArg) {
    if (validFormats.includes(formatArg)) {
        format = formatArg as any;
    } else {
        console.warn(`Invalid format ${formatArg}, default to json. Valid values: ${validFormats.join(', ')}`)
    }
}

(async () => {
    console.log(`Fetching METAR for ${code} (Format: ${format})...`)
    try {
        const params: MetarParams = {
            ids: code,
            format: format
        }

        const response = await WeatherService.getMetar(params)

        console.log("--- Response ---");
        if (typeof response === 'object') {
            console.log(JSON.stringify(response, null, 2))
        } else {
            console.log(response)
        }

    } catch (e: any) {
        console.error("Error fetching METAR:", e.message || e)
        if (e.status) {
            console.error("Status:", e.status)
        }
    } finally {
        console.log("Done.")
        process.exit(0)
    }
})()
