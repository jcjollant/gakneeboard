
import dotenv from 'dotenv'
dotenv.config()

import { HouseKeeping, Task, TaskStatus } from "../backend/HouseKeepings";

const verbose = process.argv.includes('--verbose')

HouseKeeping.perform().then(tasks => {
    const reset = "\x1b[0m"

    for (const task of tasks) {
        let color = "\x1b[32m" // Green

        if (task.status === TaskStatus.FAILED) {
            color = "\x1b[31m" // Red
        } else if (task.status !== TaskStatus.FINISHED) {
            color = "\x1b[33m" // Yellow (unknown/new)
        }

        console.log(`${task.name} ${color}[${task.status}]${reset} ${task.message}`)

        if (verbose) {
            console.log(JSON.stringify(task, null, 2))
        }
    }
    process.exit(0)
}).catch(err => {
    console.error(err);
    process.exit(1);
})
