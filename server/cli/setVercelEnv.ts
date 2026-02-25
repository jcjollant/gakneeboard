
import dotenv from 'dotenv'
dotenv.config()

import { VercelService, Target } from '../backend/services/VercelService'

const key = process.argv[2]
const value = process.argv[3]
const targetArg = process.argv[4]

if (!key || !value || !targetArg) {
    console.log("Usage: npx ts-node cli/setVercelEnv.ts <KEY> <VALUE> <TARGET>")
    console.log("Targets: production, preview, development")
    process.exit(1)
}

const target = targetArg.toLowerCase() as Target
const validTargets = Object.values(Target) as string[]

if (!validTargets.includes(target)) {
    console.error(`Invalid target: ${targetArg}. Valid values: ${validTargets.join(', ')}`)
    process.exit(1)
}

(async () => {
    console.log(`Setting Vercel environment variable ${key}=${value} for target ${target}...`)
    try {
        await VercelService.setEnvVar(key, value, [target])
        console.log("Successfully set environment variable.")
    } catch (e: any) {
        console.error("Error setting environment variable:", e.message || e)
    } finally {
        process.exit(0)
    }
})()
