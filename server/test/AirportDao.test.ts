
import { describe, expect, test } from '@jest/globals';
import { Airport, versionInvalid, AirportSource } from "../backend/models/Airport";
import { AirportDao } from '../backend/AirportDao'
import { AirportService } from '../backend/services/AirportService'

require('dotenv').config();

describe('Custom Airports', () => {
    const customCode: string = 'TEST'
    const customNameJC: string = 'Test Airport JC'
    const jcUserId: number = 1;

    test('read Custom', async () => {
        const customElevation: number = 1000
        const airport: Airport = new Airport(customCode, customNameJC, customElevation)
        airport.source = AirportSource.User;

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

        // Test deletion
        // AirportDao.deleteCustom( customCode, userId)

        // console.log( "airport " + JSON.stringify( airport))
        // AirportDAO.updateCustom( airport, userId)
    })

    test('Overlapping Custom', async () => {
        const customNameAS: string = 'Test Airport AS'
        const userIdAs = 2;
        const airportJc: Airport = new Airport(customCode, customNameJC, 1000)
        airportJc.source = AirportSource.User;
        const airportAs: Airport = new Airport(customCode, customNameAS, 1000)
        airportAs.source = AirportSource.User;
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
        const undefinedCaa = AirportService.undefinedCodeAndAirport('TEST')
        expect(undefinedCaa.code).toBe('TEST')
        expect(undefinedCaa.airport.version).toBe(versionInvalid)
    })
    test('Known Unknown', async () => {
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

