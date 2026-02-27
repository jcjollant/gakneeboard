
import dotenv from 'dotenv'
dotenv.config()

import { HouseKeeping, TaskStatus } from '../backend/maintenance/HouseKeeping'

(async () => {
    console.log("Checking for Aeronav cycle updates...")
    try {
        const task = await HouseKeeping.autoUpdateAeronavCycle()

        const reset = "\x1b[0m"
        let color = "\x1b[32m" // Green

        if (task.status === TaskStatus.FAILED) {
            color = "\x1b[31m" // Red
        } else if (task.status === TaskStatus.SKIPPED) {
            color = "\x1b[33m" // Yellow
        }

        console.log(`--- Result ---`)
        console.log(`Status:  ${color}[${task.status.toUpperCase()}]${reset}`)
        console.log(`Message: ${task.message}`)

    } catch (e: any) {
        console.error("Error running cycle update:", e.message || e)
    } finally {
        process.exit(0)
    }
})()
