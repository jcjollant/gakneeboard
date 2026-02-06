
import dotenv from 'dotenv'
dotenv.config()

import { HealthCheck, Check } from "../backend/HealthChecks";

const verbose = process.argv.includes('--verbose')

HealthCheck.perform().then(checks => {
    const reset = "\x1b[0m"

    for (const check of checks) {
        let color = "\x1b[32m" // Green

        if (check.status === Check.FAIL) {
            color = "\x1b[31m" // Red
        } else if (check.status !== Check.SUCCESS) {
            color = "\x1b[33m" // Yellow (unknown/new)
        }

        console.log(`${check.name} ${color}[${check.status}]${reset} ${check.msg}`)

        if (verbose) {
            console.log(JSON.stringify(check, null, 2))
        }
    }
    process.exit(0)
}).catch(err => {
    console.error(err);
    process.exit(1);
})
