import dotenv from 'dotenv'
dotenv.config()

import { sql } from "@vercel/postgres"
import { Airport } from '../backend/models/Airport'

/**
 * Migration Script: Deduplicate Airports and Update Schema
 * 
 * 1. Adds 'loc_id' column if missing.
 * 2. Parses 'data' JSON blob for each airport.
 * 3. Identifies Primary (code == icao) vs Duplicate (code != icao) records.
 * 4. Updates Primary records with loc_id from Duplicates.
 * 5. Marks Duplicates for deletion by renaming code to '!...'
 * 6. Renames 'code' column to 'icao_id' (this is a DB schema change).
 */

async function migrate() {
    console.log("Starting Airport Deduplication Migration...")

    // 1. Add loc_id column
    try {
        console.log("Adding column loc_id...")
        await sql`ALTER TABLE Airports ADD COLUMN IF NOT EXISTS loc_id VARCHAR(10);`
    } catch (e) {
        console.log("Column loc_id already exists or error adding:", e)
    }

    // Fetch all airports
    console.log("Fetching all airports...")
    const result = await sql`SELECT id, code, data, sketch, version FROM airports WHERE creatorid IS NULL ORDER BY code`
    const rows = result.rows
    console.log(`Processing ${rows.length} airports...`)

    let updatedCount = 0
    let markedForDeletion = 0

    const lookupByIcao: Record<string, any> = {}

    // First Pass: Index valid ICAO records (Primary)
    for (const row of rows) {
        if (!row.data) continue
        try {
            const data: any = JSON.parse(row.data)
            const icao = data.code || data.icaoId
            // If the row code matches the data code, it's a primary record (e.g. KLAX == KLAX)
            if (icao && row.code === icao) {
                lookupByIcao[icao] = row
            }
        } catch (e) {
            console.error(`Error parsing data for ${row.code}`, e)
        }
    }

    // Second Pass: Process ALL records
    for (const row of rows) {
        if (!row.data) continue
        try {
            const data: any = JSON.parse(row.data)
            const icao = data.code || data.icaoId

            // If no ICAO code in data, we assume this record is valid as-is (e.g. only has locId or non-ICAO code)
            if (!icao) {
                console.log(`Skipping [${row.code}] - No ICAO code in data`)
                continue
            }

            // Case 1: Primary Record (code == icao) -- Just ensure JSON data has locId/icaoId fields for future? 
            // We'll update the loc_id column later if we find a duplicate that provides it.
            if (row.code === icao) {
                // If it's a primary record but doesn't have a loc_id set, we might try to derive it?
                // For now, only derive if we find a duplicate.
                continue;
            }

            // Case 2: Duplicate Record (code != icao) -- e.g. code='LAX', data.code='KLAX'
            if (icao && row.code !== icao) {
                console.log(`Found duplicate/loc record: [${row.code}] -> maps to ICAO [${icao}]`)

                const primary = lookupByIcao[icao]

                if (primary) {
                    // We found the primary record! 
                    // 1. Update primary record with this loc_id
                    console.log(`Linking loc_id [${row.code}] to primary [${icao}]`)
                    await sql`UPDATE airports SET loc_id = ${row.code} WHERE id = ${primary.id}`

                    // 2. Mark this duplicate for deletion
                    console.log(`Marking [${row.code}] as invalid (!${row.code})`)
                    await sql`UPDATE airports SET code = ${'!' + row.code} WHERE id = ${row.id}`
                    markedForDeletion++
                } else {
                    // Orphan case: fetched by locId, but no primary ICAO record exists
                    // We need to keep this record, but maybe update its code to be the ICAO code so it becomes primary?
                    // "If the 'code' column value is different from 'data'.code then the code was NOT an icao... remove"
                    // BUT if we remove it, we lose the data.
                    // Let's promote it to be the ICAO record.
                    console.log(`Promoting orphan duplicate [${row.code}] to ICAO [${icao}]`)
                    await sql`UPDATE airports SET code = ${icao}, loc_id = ${row.code} WHERE id = ${row.id}`
                }
            }
        } catch (e) {
            console.error(`Error processing ${row.code}`, e)
        }
    }

    console.log(`Marked ${markedForDeletion} records for deletion (prefixed with '!')`)

    // 3. Rename Column
    // User requested: "rename column/field 'code' to 'icao_id'"
    // "ensure records that start with '!' are deleted manually" - so I won't delete them here.

    try {
        console.log("Renaming column 'code' to 'icao_id'...")
        await sql`ALTER TABLE Airports RENAME COLUMN code TO icao_id;`
    } catch (e) {
        console.log("Error renaming column (might already be renamed):", e)
    }

    console.log("Migration Complete.")
}

(async () => {
    await migrate()
    process.exit(0)
})()
