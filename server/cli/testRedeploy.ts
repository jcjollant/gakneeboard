import dotenv from 'dotenv'
dotenv.config()

import { VercelService } from '../backend/services/VercelService'

(async () => {
    console.log("Testing triggerRedeploy...")
    try {
        await VercelService.triggerRedeploy()
        console.log("Success")
    } catch (e: any) {
        console.error("Error triggering redeploy:")
        if (e.response) {
            console.error(e.response.status, e.response.data)
        } else {
            console.error(e.message || e)
        }
    } finally {
        process.exit(0)
    }
})()
