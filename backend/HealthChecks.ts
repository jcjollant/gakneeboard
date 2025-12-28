import { AirportDao } from "./AirportDao";
import { UserDao } from "./dao/UserDao";
import { Airport } from "./models/Airport";
import { User } from "./models/User";
import { PublicationDao } from './PublicationDao';
import { AdipService } from './services/AdipService';

import dotenv from 'dotenv';
import { UserTools } from "./UserTools";
dotenv.config()

export class Check {
    name: string;
    status: string;
    msg: string;
    public static FAIL: string = 'fail'
    public static SUCCESS: string = 'success'

    constructor(checkName: string) {
        this.name = checkName
        this.status = Check.SUCCESS
        this.msg = ''
    }

    fail(msg: string) {
        this.status = Check.FAIL
        this.msg = msg;
    }

    pass(msg: string) {
        this.status = Check.SUCCESS
        this.msg = msg
    }
}

export class HealthCheck {

    static async airportChecks(): Promise<Check[]> {
        const dupeCheck: Check = new Check('airportDuplicates')
        const dupeCount = await AirportDao.countDuplicates()
        if (dupeCount > 0) {
            dupeCheck.fail("Found " + dupeCount + " duplicates")
        } else {
            dupeCheck.pass("No duplicates found")
        }

        const missingSketchesCount = await AirportDao.countMissingSketches()
        const validCount = await AirportDao.countValid()
        const missingSketches: Check = new Check('airportMissingSketches')
        if (missingSketchesCount > 0) {
            missingSketches.fail(`Found ${missingSketchesCount}/${validCount} airports missing sketches`)
        } else {
            missingSketches.pass(`${validCount} airports have valid sketches`)
        }
        return [dupeCheck, missingSketches]
    }

    // figure out if the data is stale
    static async effectiveDateCheck(): Promise<Check> {
        const check: Check = new Check('effectiveDate')
        const rentonCode: string = "KRNT"

        // Force an Adip Check
        await Promise.all([AirportDao.codesLookup([rentonCode]), new AdipService().fetchAirport(rentonCode, false)]).then((results) => {
            try {
                // Check we have found Renton in the database
                if (results[0].found.length == 0) throw new Error(rentonCode + " is not in the database")

                // Check we have the correct version
                const rentonDb: Airport = results[0].found[0].airport
                if (rentonDb.version == -1) throw new Error(rentonCode + " version is invalid")

                const rentonAdip: Airport | undefined = results[1]
                if (!rentonAdip) throw new Error(rentonCode + " is not in ADIP")

                if (rentonDb.effectiveDate != rentonAdip.effectiveDate) {
                    throw new Error("effective date mismatch db=" + rentonDb.effectiveDate + ", ADIP=" + rentonAdip.effectiveDate)
                }
                if (rentonAdip.effectiveDate != (AdipService.currentEffectiveDate())) {
                    throw new Error("effective date mismatch ExpectedADIP=" + AdipService.currentEffectiveDate() + ", ActualADIP=" + rentonAdip.effectiveDate)
                }

                check.pass("Matching " + rentonDb.effectiveDate)
            } catch (e) {
                console.log('[HealthCheck.effectiveDateCheck] ' + e.message)
                check.fail(e.message)
            }
        })
        return check

    }

    static async environmentVariables(): Promise<Check> {
        const checks: Check[] = []
        const envVars: string[] = [
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'STRIPE_HH1_PRICE',
            'STRIPE_PP1_PRICE',
            'STRIPE_PP2_PRICE',
            'STRIPE_BD1_PRICE',
            'STRIPE_LD1_PRICE',
            'EFFECTIVE_DATE']

        const check: Check = new Check("Environment Variables")
        for (const envVar of envVars) {
            if (!(envVar in process.env)) {
                check.fail("EnvVar missing " + envVar)
                return check;
            }
        }
        check.pass('Found ' + envVars.length + ' variables')
        return check
    }

    static async availablePublicationsCheck(): Promise<Check> {
        const check: Check = new Check('publications')
        const availableCount: number = await PublicationDao.countAvailable()
        if (availableCount < 600) {
            check.fail("Only " + availableCount + " publications available")
        } else {
            check.pass("We have " + (1296 - availableCount) + "/ 1296 publications")
        }
        return check
    }

    static async users(): Promise<Check> {
        const check: Check = new Check('users')
        const users: User[] = await new UserDao().getAll()
        const count: number = users.length
        const unknownSources = users.reduce((acc, user: User) => {
            if (UserTools.hasValidSource(user)) return acc;
            return acc + 1
        }, 0)
        if (unknownSources > 0) {
            check.fail(`${unknownSources} of ${count} have invalid sources`)
        } else {
            check.pass(`${count} users have valid a source`)
        }
        return check

    }

    public static async perform(): Promise<Check[]> {
        const airportChecks = await HealthCheck.airportChecks()
        const allChecks = await Promise.all([
            HealthCheck.effectiveDateCheck(),
            HealthCheck.environmentVariables(),
            HealthCheck.availablePublicationsCheck(),
            HealthCheck.users()
        ])
        allChecks.push(...airportChecks)
        return allChecks
    }
}
