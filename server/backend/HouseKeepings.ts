import { Business } from "./business/Business"
import { UserDao } from "./dao/UserDao"
import { Email, EmailType } from "./Email"
import { Metric } from "./Metrics"

export enum TaskStatus {
    NEW = 'new',
    STARTED = 'started',
    FINISHED = 'finished',
    FAILED = 'failed'
}

export class Task {
    name: string
    status: TaskStatus
    message: string
    duration: number
    startTime: number

    constructor(name: string) {
        this.name = name
        this.status = TaskStatus.NEW
        this.message = ''
        this.duration = 0
        this.startTime = 0
    }

    start() {
        this.status = TaskStatus.STARTED
        this.startTime = Date.now()
    }

    finish(message: string) {
        this.status = TaskStatus.FINISHED
        this.message = message
        this.duration = Date.now() - this.startTime
    }

    fail(message: string) {
        this.status = TaskStatus.FAILED
        this.message = message
        this.duration = Date.now() - this.startTime
    }
}

export class HouseKeeping {
    public static async perform(): Promise<Task[]> {
        const tasks: Task[] = []

        // Refill task
        const refillTask = new Task('Monthly Refills')
        refillTask.start()
        try {
            const [refills, performed] = await Business.freePrintRefills(new UserDao())
            if (performed) {
                refillTask.finish(`Refilled performed. ${refills.length} users benefitted`)
            } else {
                refillTask.finish(`Skipped. Refills not due`)
            }
        } catch (e: any) {
            refillTask.fail(e.message)
        }
        tasks.push(refillTask)

        return tasks
    }
    public static async performAdipCleanup(): Promise<Metric> {
        return new Promise((resolve, reject) => {
            resolve(new Metric('Adip Clean Up', 0))
        })
    }
}