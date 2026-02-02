import { Check, HealthCheck } from './HealthChecks'
import { Metrics, MetricKey } from '../backend/Metrics'
import { UserView } from './models/UserView';
import { Business } from './business/Business';
import { sql } from '@vercel/postgres';
import { UserDao } from './dao/UserDao';
import { Email, EmailType } from './Email';
import { AirportSketch } from './AirportSketch';
import { AirportDao } from './AirportDao';
import { TicketService } from './services/TicketService';

export class Maintenance {
    code: string;
    static codeLogin: string = '12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146'
    static codeMetrics: string = 'd709064984df563c2d380045342e79902e32e769c11bd44c4a31c85ffa250992'
    static codeTest: string = '4d51414ceb16fe67ec67ef5194a76036fc54b59846c9e8da52841717fe4b6247'
    static codeHousekeeping = 'a4a474fbddd09c797707112a1c6f4f82b83a6e256ea562fb124739b3cdb888c4'
    static codeSketch = '8d4074fbddd09c797707112a1c6f4f82b83a6e256ea562fb124739b3cdb888c5'
    static allCodes: string[] = [Maintenance.codeLogin, Maintenance.codeMetrics, Maintenance.codeTest, Maintenance.codeHousekeeping, Maintenance.codeSketch]

    constructor(code: string) {
        this.code = code
    }

    // find out if a code is valid or not
    isValidCode(): boolean {
        return Maintenance.allCodes.includes(this.code)
    }

    async perform(): Promise<string> {
        return new Promise<string>(async (res, rej) => {
            const handleCrash = (e: any) => {
                TicketService.create(3, `[Maintenance] crashed ${this.code}: ${e}`)
                rej(e)
            }

            if (this.code == Maintenance.codeHousekeeping) { // This is Willie
                Maintenance.willie().then(res).catch(handleCrash)
            } else if (this.code == Maintenance.codeLogin) {
                const hash = "357c3920bbfc6eefef7e014ca49ef12c78bb875c0826efe90194c9978303a8d3"
                UserView.fromHash(hash).then((umv: UserView | undefined) => {
                    if (umv) {
                        res(JSON.stringify(umv))
                    } else {
                        rej('Invalid User')
                    }
                }).catch(handleCrash)
            } else if (this.code == Maintenance.codeMetrics) { // This is Waylon
                Maintenance.waylon().then(res).catch(handleCrash)
            } else if (this.code == Maintenance.codeTest) {
                res('OK')
            } else if (this.code == Maintenance.codeSketch) { // This is Marge
                Maintenance.sketchUpdate().then(res).catch(handleCrash)
            } else {
                TicketService.create(3, `[Maintenance] Invalid Code: ${this.code}`)
                rej('Invalid Code')
            }
        })
    }

    /**
     * Waylon performs metring
     */
    static async waylon(sendEmail: boolean = true, commit: boolean = true): Promise<string> {
        return Metrics.perform().then(async metrics => {
            const data: any = {}
            for (const metric of metrics) {
                // if we received an array, flatten it
                if (Array.isArray(metric)) {
                    for (const m of metric) {
                        data[m.name] = m.value
                    }
                } else {
                    data[metric.name] = metric.value
                }
            }
            const dataString: string = JSON.stringify(data)
            const emailString = [
                'u=' + data[MetricKey.users],
                't=' + data[MetricKey.templates],
                'pg=' + data[MetricKey.pagesTotal],
                'ac=' + data[MetricKey.customersActive],
                'p7=' + data[MetricKey.print7],
                's7=' + data[MetricKey.save7]
            ].join(', ') + '\n'
            if (sendEmail) {
                // console.log('[Maintenance.waylon] sending email')
                await Email.send(emailString + dataString, EmailType.Metrics)
            } else {
                console.log('[Maintenance.waylon] skipping email')
            }
            if (commit) {
                await sql`INSERT INTO metrics (data) VALUES (${dataString})`;
            } else {
                console.log('[Maintenance.waylon] skipping commit')
            }
            return dataString
        })
    }

    static async performHealthChecks() {
        const [checks, refills] = await Promise.all([
            HealthCheck.perform(),
            Business.freePrintRefills(new UserDao())
        ]);
        return { checks, refills }
    }

    /**
     * Willie perform chechs and routine maintenance
     */
    static async willie(sendEmail: boolean = true, persistRecord: boolean = true): Promise<string> {
        let failedChecks: number = 0
        let messages: string[] = []

        try {
            const { checks, refills } = await Maintenance.performHealthChecks();

            const data: string = JSON.stringify(checks)
            // console.log( '[HealthCheck.perform]', data, 'failures', failedChecks)
            const failures = checks.filter((check) => check.status === Check.FAIL)
            failedChecks = failures.length

            if (failedChecks === 0) {
                messages.push('All Clear')
            } else {
                for (const check of failures) {
                    messages.push(check.name + ' : ' + check.msg)
                }
            }
            messages.push(data)
            // save record
            if (persistRecord) {
                await sql`INSERT INTO health_checks (data,failures) VALUES (${data},${failedChecks})`
            }

            messages.push('Refilled ' + refills.length + ' users')
        } catch (e) {
            throw e
        }

        // cook email with business
        const output = messages.join('\n\n')
        if (sendEmail) {
            await Email.send(output, EmailType.Housekeeping)
        } else {
            console.log('[Maintenance.willie] not sending email \n' + output)
        }
        return output
    }
    /**
     * Update sketches for airports that miss one
     */
    static async sketchUpdate(): Promise<string> {
        const cycle = process.env.AERONAV_DATA_CYCLE
        const limit = 5
        const airports = await AirportDao.readMissingSketch(limit)
        let updated = 0
        let logs: string[] = []

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
        if (updated > 0) {
            await Email.send(message, EmailType.SketchUpdate)
        }
        return message
    }
}