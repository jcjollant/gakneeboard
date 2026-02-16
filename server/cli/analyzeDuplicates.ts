import dotenv from 'dotenv'
dotenv.config()

import { sql } from "@vercel/postgres"
import { Airport } from '../backend/models/Airport'

async function listDuplicates() {
    console.log("Listing duplicates...")
    const result = await sql`
        SELECT code, version, data, sketch FROM airports WHERE creatorid IS NULL ORDER BY code;
    `
    const rows = result.rows
    console.log(`Analyzing ${rows.length} airports...`)

    const duplicates: Record<string, any[]> = {}
    let count = 0

    // Group by ICAO code from DATA (not column code)
    for (const row of rows) {
        try {
            const data: Airport = JSON.parse(row.data)
            // The existing data.code is usually the ICAO code.
            const icao = data.code
            if (!duplicates[icao]) {
                duplicates[icao] = []
            }
            duplicates[icao].push(row)
        } catch (e) {
            console.error(`Failed to parse data for ${row.code}`, e)
        }
    }

    for (const icao in duplicates) {
        if (duplicates[icao].length > 1) {
            console.log(`Duplicate found for ${icao}:`)
            duplicates[icao].forEach(d => {
                const data = JSON.parse(d.data)
                console.log(` - Code: ${d.code}, Version: ${d.version}, Sketch: ${d.sketch || 'N/A'}, LocId: ${data.locId || 'N/A'}`)
            })
            count++
        }
    }
    console.log(`Total duplicates groups found: ${count}`)
}

(async () => {
    await listDuplicates()
    process.exit(0)
})()
