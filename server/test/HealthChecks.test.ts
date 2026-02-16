
import { describe, expect, test, jest, afterEach, beforeEach, afterAll } from '@jest/globals';
import { HealthCheck, Check } from '../backend/maintenance/HealthChecks';
import { AirportDao } from '../backend/AirportDao';
import { AdipService } from '../backend/services/AdipService';
import { Airport } from '../backend/models/Airport';
import { CodeAndAirport } from '../backend/models/CodeAndAirport';
import { AirportChartData } from '../backend/models/AirportChartData';

describe('HealthChecks', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('adipEffectiveDate', () => {
        const rentonCode = "KRNT";

        test('Success', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, undefined, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;
            renton.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.adipEffectiveDate();
            expect(result.status).toBe(Check.SUCCESS);
            expect(result.msg).toContain("Matching " + currentEffectiveDate);
        });

        test('Failure: Airport not in DB', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, undefined, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [], notFound: [rentonCode] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.adipEffectiveDate();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain(rentonCode + " is not in the database");
        });

        test('Failure: Airport in DB but invalid version', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, undefined, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;
            renton.version = -1; // Invalid version
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [rentonCaa], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.adipEffectiveDate();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toMatch(new RegExp(`${rentonCode} .*invalid`));
        });

        test('Failure: Airport not in ADIP', async () => {
            const currentEffectiveDate = "20260101";
            const renton = new Airport(rentonCode, undefined, "Renton", 42);
            renton.effectiveDate = currentEffectiveDate;
            renton.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(undefined);

            const result = await HealthCheck.adipEffectiveDate();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain(rentonCode + " is not in ADIP");
        });

        test('Failure: DB effective date mismatch ADIP', async () => {
            const currentEffectiveDate = "20260101";
            const oldEffectiveDate = "20251201";
            const rentonDb = new Airport(rentonCode, undefined, "Renton", 42);
            rentonDb.effectiveDate = oldEffectiveDate;
            rentonDb.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, rentonDb);

            const rentonAdip = new Airport(rentonCode, undefined, "Renton", 42);
            rentonAdip.effectiveDate = currentEffectiveDate;

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(rentonAdip);

            const result = await HealthCheck.adipEffectiveDate();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain("effective date mismatch db=");
        });

        test('Failure: ADIP effective date mismatch Current', async () => {
            const wrongEffectiveDate = "20251201";
            const currentEffectiveDate = "20260101";

            const renton = new Airport(rentonCode, undefined, "Renton", 42);
            renton.effectiveDate = wrongEffectiveDate;
            renton.version = Airport.currentVersion;
            const rentonCaa = new CodeAndAirport(rentonCode, renton);

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue(currentEffectiveDate);
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [rentonCaa], knownUnknown: [], notFound: [] });
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(renton);

            const result = await HealthCheck.adipEffectiveDate();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain("effective date mismatch ExpectedADIP=");
        });
    });

    describe('adipDataCycle', () => {
        const currentCycle = "2501";

        beforeEach(() => {
            process.env.AERONAV_DATA_CYCLE = currentCycle;
        });

        afterEach(() => {
            delete process.env.AERONAV_DATA_CYCLE;
        });

        test('Success', async () => {
            const acd = new AirportChartData();
            acd.cycle = currentCycle;

            jest.spyOn(AdipService, 'fetchAirportChartData').mockResolvedValue(acd);

            const result = await HealthCheck.adipDataCycle();
            expect(result.status).toBe(Check.SUCCESS);
            expect(result.msg).toContain("Matching " + currentCycle);
        });

        test('Failure: Cycle mismatch', async () => {
            const acd = new AirportChartData();
            acd.cycle = "1900"; // Mismatch

            jest.spyOn(AdipService, 'fetchAirportChartData').mockResolvedValue(acd);

            const result = await HealthCheck.adipDataCycle();
            expect(result.status).toBe(Check.FAIL);
            expect(result.msg).toContain("Cycle mismatch Env=" + currentCycle + ", ADIP=1900");
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
            process.env.STRIPE_PRODUCT_REFCARD_PRICE = 'test';
            process.env.BLOB_READ_WRITE_TOKEN = 'test';
            process.env.POSTGRES_URL = 'test';
            process.env.EFFECTIVE_DATE = 'test';
            process.env.NMS_API_URL = 'test';
            process.env.NMS_API_KEY = 'test';
            process.env.NMS_API_SECRET = 'test';
            process.env.AERONAV_DATA_CYCLE = 'test';
            process.env.SUPABASE_URL = 'test';
            process.env.SUPABASE_SERVICE_ROLE_KEY = 'test';

            const result = await HealthCheck.environmentVariables();
            expect(result.status).toBe(Check.SUCCESS);
            expect(result.msg).toContain('Found 18 variables');
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
