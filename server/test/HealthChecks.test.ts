
import { describe, expect, test, jest, afterEach, beforeEach, afterAll } from '@jest/globals';
import { HealthCheck, Check } from '../backend/HealthChecks';
import { AirportDao } from '../backend/AirportDao';
import { AdipService } from '../backend/services/AdipService';
import { Airport } from '../backend/models/Airport';
import { CodeAndAirport } from '../backend/models/CodeAndAirport';

describe('HealthChecks', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('effectiveDateCheck', () => {
        const rentonCode = "KRNT";

        test('Success', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;
            renton.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.effectiveDateCheck();
            expect(result.status).toBe(Check.SUCCESS);
            expect(result.msg).toContain("Matching " + currentEffectiveDate);
        });

        test('Failure: Airport not in DB', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [], notFound: [rentonCode] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.effectiveDateCheck();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain(rentonCode + " is not in the database");
        });

        test('Failure: Airport in DB but invalid version', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;
            renton.version = -1; // Invalid version
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            // Assuming codesLookup puts invalid version airports in knownUnknown, but HealthChecks logic might look at found.
            // Wait, HealthCheck logic explicitly checks result.found[0].
            // If we strictly follow the new signature, we need to adapt the test data or the HealthCheck logic.
            // BUT, the HealthCheck code I read earlier uses `results[0].found`. 
            // Wait, I ALREADY CHANGED `codesLookup` signature in `AirportDao.ts` to return `known` and `knownUnknown`.
            // So `HealthChecks.ts` MUST BE BROKEN right now because it tries to access `.found`.
            // I should have caught this in the refactor step! 
            // I need to fix HealthChecks.ts first or simultaneously. 
            // Let's assume for this test file that I am testing the Logic AS IT SHOULD BE or AS IT IS.
            // If I write the test now, it will fail to compile or run because `found` property is missing on the result of `codesLookup`.

            // Re-reading HealthChecks.ts content provided in Step 62:
            // Line 67: if (results[0].found.length == 0)...

            // My previous refactor removed `found`. 
            // So `HealthChecks.ts` is currently broken. I missed this usage of `codesLookup`.

            // I will implement the test expecting the FIX to HealthChecks.ts as well. 
            // I will mock `codesLookup` to return the NEW structure.
            // And I will update `HealthChecks.ts` in the next step to use `known` list.

            // For this test "Invalid Version", it would come back in `knownUnknown` list from `codesLookup`.
            // So `known` would be empty.

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [rentonCaa], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.effectiveDateCheck();
            expect(result.status).toBe(Check.FAIL);
            // The message depends on how I fix HealthChecks.ts. 
            // If I look in knownUnknown, I can say "version is invalid".
            // If I only look in known, I will say "not in database" (as known).
            // The existing logic threw "version is invalid".
            // So likely I should check if it is in knownUnknown.
            expect(result.msg).toMatch(new RegExp(`${rentonCode} .*invalid`));
        });

        test('Failure: Airport not in ADIP', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;
            renton.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(undefined);

            const result = await HealthCheck.effectiveDateCheck();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain(rentonCode + " is not in ADIP");
        });

        test('Failure: DB effective date mismatch ADIP', async () => {
            const currentEffectiveDate = "20260101";
            const oldEffectiveDate = "20251201";
            const rentonDb = new Airport(rentonCode, "Renton", 42);
            rentonDb.effectiveDate = oldEffectiveDate;
            rentonDb.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, rentonDb);

            const rentonAdip = new Airport(rentonCode, "Renton", 42);
            rentonAdip.effectiveDate = currentEffectiveDate;

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(rentonAdip);

            const result = await HealthCheck.effectiveDateCheck();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain("effective date mismatch db=");
        });
        test('Failure: ADIP effective date mismatch Current', async () => {
            const wrongEffectiveDate = "20251201";
            const currentEffectiveDate = "20260101";

            const renton = new Airport(rentonCode, "Renton", 42);
            renton.effectiveDate = wrongEffectiveDate;
            renton.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.effectiveDateCheck();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain("effective date mismatch ExpectedADIP=");
        });
    });

    describe('environmentVariables', () => {
        const OLD_ENV = process.env;

        beforeEach(() => {
            jest.resetModules(); // Most important - it clears the cache
            process.env = { ...OLD_ENV }; // Make a copy
        });

        afterAll(() => {
            process.env = OLD_ENV; // Restore old environment
        });

        test('Success: All variables present', async () => {
            process.env.STRIPE_SECRET_KEY = 'test';
            process.env.STRIPE_WEBHOOK_SECRET = 'test';
            process.env.STRIPE_HH1_PRICE = 'test';
            process.env.STRIPE_PP1_PRICE = 'test';
            process.env.STRIPE_PP2_PRICE = 'test';
            process.env.STRIPE_BD1_PRICE = 'test';
            process.env.STRIPE_LD1_PRICE = 'test';
            process.env.BLOB_READ_WRITE_TOKEN = 'test';
            process.env.POSTGRES_URL = 'test';
            process.env.EFFECTIVE_DATE = 'test';
            process.env.NMS_API_URL = 'test';
            process.env.NMS_API_KEY = 'test';
            process.env.NMS_API_SECRET = 'test';

            const result = await HealthCheck.environmentVariables();
            expect(result.status).toBe(Check.SUCCESS);
            expect(result.msg).toContain('Found 14 variables');
        });

        test('Failure: Missing variable', async () => {
            process.env.STRIPE_SECRET_KEY = 'test';
            // remove STRIPE_WEBHOOK_SECRET
            delete process.env.STRIPE_WEBHOOK_SECRET;
            // Missing STRIPE_WEBHOOK_SECRET

            const result = await HealthCheck.environmentVariables();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain('EnvVar missing STRIPE_WEBHOOK_SECRET');
        });
    });

    describe('tickets', () => {
        const TicketService = require('../backend/services/TicketService').TicketService;

        test('Success: No open tickets', async () => {
            jest.spyOn(TicketService, 'countOpenTickets').mockResolvedValue(0);
            const result = await HealthCheck.tickets();
            expect(result.status).toBe(Check.SUCCESS);
            expect(result.msg).toBe('No open tickets');
        });

        test('Failure: Open tickets found', async () => {
            jest.spyOn(TicketService, 'countOpenTickets').mockResolvedValue(5);
            const result = await HealthCheck.tickets();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toBe('Found 5 open tickets');
        });
    });
});
