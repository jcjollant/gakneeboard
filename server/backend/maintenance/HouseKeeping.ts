import { AirportDao } from "../AirportDao"
import { AirportSketch } from "../AirportSketch"
import { Business } from "../business/Business"
import { UserDao } from "../dao/UserDao"
import { PrintOrderDao } from '../dao/PrintOrderDao';
import { PrintService } from '../services/PrintService';
import { PrintProductType, PrintOrderStatus } from '@gak/shared';
import { TemplateHistoryDao } from "../dao/TemplateHistoryDao";
import { AdipService } from "../services/AdipService";
import { Target, VercelService } from "../services/VercelService";


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
        const tasksResults = await Promise.all([
            HouseKeeping.performRefills(),
            HouseKeeping.performSketchUpdate(),
            HouseKeeping.cleanAbandonedOrders(),
            HouseKeeping.cleanTemplateHistory(),
            HouseKeeping.autoUpdateAeronavCycle()
        ])

        tasks.push(...tasksResults)

        // Check if any task updated environment variables and trigger redeploy if needed
        const updateTask = tasksResults.find(t => t.name === 'Aeronav Cycle Update')
        if (updateTask && updateTask.status === TaskStatus.FINISHED) {
            console.log('[HouseKeeping.perform] Aeronav cycle updated, triggering redeploy...')
            try {
                await VercelService.triggerRedeploy()
            } catch (e: any) {
                console.error('[HouseKeeping.perform] Failed to trigger redeploy', e.message)
                // We don't fail the whole perform, but we log the error
            }
        }

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

    public static async cleanTemplateHistory(): Promise<Task> {
        const task = new Task('Template History Cleanup')
        task.start()
        try {
            const deleted = await TemplateHistoryDao.cleanHistory(30)
            if (deleted > 0) {
                task.finish(`Cleaned ${deleted} old template history entries`)
            } else {
                task.skip(`No old template history entries to clean`)
            }
        } catch (e: any) {
            task.fail(e.message)
        }
        return task
    }

    /**
     * Checks ADIP for new cycle and updates Vercel environment variables if needed
     */
    public static async autoUpdateAeronavCycle(): Promise<Task> {
        const task = new Task('Aeronav Cycle Update')
        task.start()
        try {
            const currentCycle = process.env.AERONAV_DATA_CYCLE
            const currentEffectiveDate = process.env.EFFECTIVE_DATE

            const adipInfo = await AdipService.fetchCurrentCycleInfo()

            if (adipInfo.cycle !== currentCycle || adipInfo.effectiveDate !== currentEffectiveDate) {
                console.log(`[HouseKeeping.autoUpdateAeronavCycle] New cycle detected: ${adipInfo.cycle} vs ${currentCycle} and ${adipInfo.effectiveDate} vs ${currentEffectiveDate}`)

                // Update Vercel environment variables
                await VercelService.setEnvVar('AERONAV_DATA_CYCLE', adipInfo.cycle, [Target.PRODUCTION, Target.PREVIEW])
                await VercelService.setEnvVar('EFFECTIVE_DATE', adipInfo.effectiveDate, [Target.PRODUCTION, Target.PREVIEW])

                task.finish(`Updated to ${adipInfo.cycle} (${adipInfo.effectiveDate})`)
            } else {
                task.skip(`Already up to date: ${currentCycle}`)
            }
        } catch (e: any) {
            console.error('[HouseKeeping.autoUpdateAeronavCycle] Failed', e.message)
            task.fail(e.message)
        }
        return task
    }

}