
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { AirportService } from '../../backend/services/AirportService';
import { AirportDao } from '../../backend/AirportDao';
import { AirportCreationRequest } from '../../backend/models/AirportCreationRequest';
import { AirportSource } from '../../backend/models/Airport';
require('dotenv').config();

const RUN_INTEGRATION_TESTS = process.env.RUN_INTEGRATION_TESTS === 'true';

describe('Airport Creation Integration Flow', () => {

    if (!RUN_INTEGRATION_TESTS) {
        test('Skipping integration tests', () => {
            console.log('Skipping integration tests. Set RUN_INTEGRATION_TESTS=true to run.');
            expect(true).toBe(true);
        });
        return;
    }

    const testCode = `T${Math.floor(Math.random() * 900) + 100}`; // Random T100-T999
    const testUser = 1; // Assuming a valid user ID for testing, or use a setup step to get one if needed. Using 1 for now as a likely existing ID or stub.
    // Actually, createAirport doesn't take userId directly for creation, it takes a request object.
    // But reading might wait, let's see.

    beforeAll(async () => {
        // Cleanup incase previous run failed
        const { sql } = require('@vercel/postgres');
        await sql`DELETE FROM airports WHERE code = ${testCode}`;
    });

    afterAll(async () => {
        // Clean up
        const { sql } = require('@vercel/postgres');
        await sql`DELETE FROM airports WHERE code = ${testCode}`;
    });

    test('Should create an airport and persist it with source=user', async () => {
        const payload: AirportCreationRequest = {
            code: testCode,
            name: 'Integration Test Airport',
            elevation: 100,
            trafficPatternAltitude: 1000,
            runways: [],
            frequencies: [],
        };

        // 1. Create Airport
        const createdAirport = await AirportService.createAirport(payload);
        expect(createdAirport).toBeDefined();
        expect(createdAirport.code).toBe(testCode);
        expect(createdAirport.source).toBe(AirportSource.User);

        // 2. Verify in DB
        // readList takes a list of codes and optionally a userId.
        // If we don't pass userId, it queries where creatorId is NULL.
        // Since AirportService.createAirport doesn't seem to set creatorId, this should work.
        const lookupResult = await AirportDao.codesLookup([testCode]);

        expect(lookupResult.known.length).toBeGreaterThan(0);
        const found = lookupResult.known.find(ca => ca.code === testCode);
        expect(found).toBeDefined();
        if (found && found.airport) {
            expect(found.airport.name).toBe(payload.name);
            expect(found.airport.source).toBe(AirportSource.User);
        } else {
            throw new Error('Airport not found in DB after creation');
        }
    });

});
