import { AirportDao } from "../AirportDao"
import { AirportSketch } from "../AirportSketch"
import { Business } from "../business/Business"
import { UserDao } from "../dao/UserDao"
import { PrintOrderDao } from '../dao/PrintOrderDao';
import { PrintService } from '../services/PrintService';
import { PrintProductType, PrintOrderStatus } from '../../../shared';

export enum TaskStatus {
    NEW = 'new',
    STARTED = 'started',
    SKIPPED = 'skipped',
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

    skip(message: string) {
        this.status = TaskStatus.SKIPPED
        this.message = message
        this.duration = Date.now() - this.startTime
    }
}

export class HouseKeeping {
    public static async perform(): Promise<Task[]> {
        const tasks: Task[] = []

        // Refill task
        await Promise.all([
            HouseKeeping.performRefills(),
            HouseKeeping.performSketchUpdate(),
            HouseKeeping.cleanAbandonedOrders()
        ]).then((t) => {
            tasks.push(t[0])
            tasks.push(t[1])
            tasks.push(t[2])
        })

        return tasks
    }

    public static async performRefills(): Promise<Task> {
        const task = new Task('Monthly Refills')
        task.start()
        try {
            const [refills, performed] = await Business.freePrintRefills(new UserDao())
            if (performed) {
                task.finish(`Refilled performed. ${refills.length} users benefitted`)
            } else {
                task.skip(`Refills not due`)
            }
        } catch (e: any) {
            task.fail(e.message)
        }
        return task
    }

    /**
     * Updates sketches for airports that miss one
     */
    public static async performSketchUpdate(): Promise<Task> {
        const task = new Task('Airport Sketch Update')
        task.start()
        const cycle = process.env.AERONAV_DATA_CYCLE
        const limit = 50
        const airports = await AirportDao.readMissingSketch(limit)
        let updated = 0
        let logs: string[] = []

        if (airports.length === 0) {
            task.skip(`No airports missing sketches`)
            return task
        }

        for (const airport of airports) {
            try {
                if (!airport.iap || airport.iap.length < 1) {
                    await AirportSketch.resolve(airport)
                    continue;
                }
                const before = airport.iap[0].pdf
                const iap = before.split('/')[1]
                airport.iap[0].pdf = cycle + '/' + iap

                await AirportSketch.resolve(airport)
                updated++
                logs.push(`Updated ${airport.code}`)

                // wait a bit to be nice to the APIs
                await new Promise(resolve => setTimeout(resolve, 500))

            } catch (err) {
                logs.push(`Failed ${airport.code}: ${err}`)
            }
        }

        const message = `Processed ${airports.length}. Updated ${updated}. \n` + logs.join('\n')
        task.finish(message)

        return task
    }

    public static async cleanAbandonedOrders(): Promise<Task> {
        const task = new Task('Clean Abandoned Orders')
        task.start()
        try {
            const drafts = await PrintOrderDao.getAbandonedDrafts(7);
            if (drafts.length === 0) {
                task.skip('No abandoned drafts found')
                return task;
            }

            let deleted = 0;
            for (const draft of drafts) {
                // Delete blobs for custom items
                if (draft.items) {
                    for (const item of draft.items) {
                        if (item.productType === PrintProductType.CUSTOM && item.pdfUrl) {
                            try {
                                await PrintService.deletePdf(item.pdfUrl);
                            } catch (e) {
                                console.error('[HouseKeeping.cleanAbandonedOrders] Failed to delete blob', item.pdfUrl, e);
                            }
                        }
                    }
                }
                // Mark as ABANDONED
                await PrintOrderDao.updateStatus(draft.id, PrintOrderStatus.ABANDONED);
                deleted++;
            }
            task.finish(`Cleaned ${deleted} abandoned orders`);
        } catch (e: any) {
            task.fail(e.message)
        }
        return task
    }
}