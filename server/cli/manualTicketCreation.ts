import dotenv from 'dotenv'
dotenv.config()

import { TicketService } from '../backend/services/TicketService'

const severity = Number(process.argv[2])
const message = process.argv[3]

if (!severity || !message) {
    console.log("Usage: npx ts-node housekeeping/manualTicketCreation.ts <SEVERITY> <MESSAGE>")
    process.exit(1)
}

(async () => {
    console.log(`Creating ticket with severity ${severity} and message "${message}"...`)
    try {
        await TicketService.create(severity, message)
        console.log("Ticket created successfully.")
    } catch (e) {
        console.error("Error creating ticket:", e)
    } finally {
        process.exit(0)
    }
})()
