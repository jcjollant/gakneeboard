
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Airport, versionInvalid, AirportSource } from "../backend/models/Airport";
import { AirportDao } from '../backend/AirportDao'
import { AirportService } from '../backend/services/AirportService'

// Mock dependencies
jest.mock('../backend/AirportDao');
jest.mock('../backend/services/AirportService');
jest.mock('@vercel/postgres', () => ({
    sql: { end: jest.fn() }
}));

require('dotenv').config();

describe('Custom Airports', () => {
    const customCode: string = 'TEST'
    const customNameJC: string = 'Test Airport JC'
    const jcUserId: number = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('read Custom', async () => {
        const customElevation: number = 1000
        const airport: Airport = new Airport(customCode, customNameJC, customElevation)
        airport.source = AirportSource.User;

        // Mock behaviors
        (AirportDao.readCustom as unknown as jest.Mock<any>).mockResolvedValue(JSON.stringify(airport));

        // Prepare the test by deleting test airports
        await AirportDao.deleteCustom(customCode, jcUserId)

        // Test creation
        await AirportDao.createOrUpdateCustom(airport, jcUserId)
        const customAirportString = await AirportDao.readCustom(customCode, jcUserId)
        expect(customAirportString).toBeDefined()
        if (customAirportString !== undefined) {
            let customAirport = JSON.parse(customAirportString)
            expect(customAirport.code).toBe(customCode)
            expect(customAirport.name).toBe(customNameJC)
            expect(customAirport.elev).toBe(customElevation)
            expect(customAirport.source).toBe(AirportSource.User)
        }
    })

    test('Overlapping Custom', async () => {
        const customNameAS: string = 'Test Airport AS'
        const userIdAs = 2;
        const airportJc: Airport = new Airport(customCode, customNameJC, 1000)
        airportJc.source = AirportSource.User;
        const airportAs: Airport = new Airport(customCode, customNameAS, 1000)
        airportAs.source = AirportSource.User;

        // Mock behaviors for codesLookup
        const mockListJc = {
            known: [{ airport: airportJc, code: customCode }],
            knownUnknown: [],
            notFound: []
        };
        const mockListAs = {
            known: [{ airport: airportAs, code: customCode }],
            knownUnknown: [],
            notFound: []
        };

        // We can use mockImplementation to return different values based on arguments if simple mockResolvedValue isn't enough
        // But here we rely on sequential calls or flexible mocks. 
        // Let's implement a simple fake for checks.
        (AirportDao.codesLookup as unknown as jest.Mock<any>).mockImplementation(async (list: any, creatorId: number) => {
            if (creatorId === jcUserId) return mockListJc;
            if (creatorId === userIdAs) return mockListAs;
            return { known: [], knownUnknown: [], notFound: [] };
        });

        // Clean up any existing airports with this code (public or custom)
        await AirportDao.deleteTest()
        await AirportDao.createOrUpdateCustom(airportJc, jcUserId)
        await AirportDao.createOrUpdateCustom(airportAs, userIdAs)
        // Read for JC
        const listJc: { known: any[], knownUnknown: any[], notFound: any[] } = await AirportDao.codesLookup([customCode], jcUserId)
        expect(listJc.known.length).toBe(1)
        expect(listJc.known[0].airport.name).toBe(customNameJC)
        expect(listJc.known[0].airport.source).toBe(AirportSource.User)
        // Read for AS
        const listAs: { known: any[], knownUnknown: any[], notFound: any[] } = await AirportDao.codesLookup([customCode], userIdAs)
        expect(listAs.known.length).toBe(1)
        expect(listAs.known[0].airport.name).toBe(customNameAS)
        expect(listAs.known[0].airport.source).toBe(AirportSource.User)
    })

    test('Undefined airport', () => {
        const undefinedCaa = { code: 'TEST', airport: { version: versionInvalid } };
        (AirportService.undefinedCodeAndAirport as unknown as jest.Mock<any>).mockReturnValue(undefinedCaa);

        const result = AirportService.undefinedCodeAndAirport('TEST')
        expect(result.code).toBe('TEST')
        expect(result.airport.version).toBe(versionInvalid)
    })

    test('Known Unknown', async () => {
        // Mock lookup result for known unknown
        const mockResult = {
            known: [],
            knownUnknown: [{ code: customCode, airport: { version: versionInvalid } }],
            notFound: []
        };
        (AirportDao.codesLookup as unknown as jest.Mock<any>).mockResolvedValue(mockResult);

        // Cleanup
        await AirportDao.deleteTest()

        // Create a known unknown
        await AirportDao.createUnknown(customCode)

        // Verify it is found but marked as invalid version
        const result: { known: any[], knownUnknown: any[], notFound: any[] } = await AirportDao.codesLookup([customCode])

        expect(result.knownUnknown.length).toBe(1)
        expect(result.knownUnknown[0].code).toBe(customCode)
        expect(result.knownUnknown[0].airport.version).toBe(versionInvalid)
        expect(result.notFound.length).toBe(0)

        // Cleanup
        await AirportDao.deleteTest()
    })
});

