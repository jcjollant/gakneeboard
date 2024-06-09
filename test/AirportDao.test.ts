
import {describe, expect, test} from '@jest/globals';
import { Airport, Runway } from "../backend/models/Airport.ts"; 
import { AirportDao } from '../backend/AirportDao.ts'

process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"

describe('Custom Airports', () => {
    const userIdJc = 1; // JC
    const customCode:string = 'TEST'
    const customNameJC:string = 'Test Airport JC'

    test('read Custom', async () => {
        const customElevation:number = 1000
        const airport:Airport = new Airport(customCode,customNameJC, customElevation)
        
        // Prepare the test by deleting test airports
        await AirportDao.deleteCustom( customCode, userIdJc)

        // Test creation
        await AirportDao.createCustom( airport, userIdJc)
        const customAirportString = await AirportDao.readCustom(customCode, userIdJc)
        expect(customAirportString).toBeDefined()
        if(customAirportString !== undefined) {
            let customAirport = JSON.parse(customAirportString)
            expect(customAirport.code).toBe(customCode)
            expect(customAirport.name).toBe(customNameJC)
            expect(customAirport.elev).toBe(customElevation)
        }

        // Test deletion
        // AirportDao.deleteCustom( customCode, userId)

        // console.log( "airport " + JSON.stringify( airport))
        // AirportDAO.updateCustom( airport, userId)
    })

    test('Overlapping Custom', async () => {
        const customNameAS:string = 'Test Airport AS'
        const userIdAs = 2;
        const airportJc:Airport = new Airport(customCode,customNameJC, 1000)
        const airportAs:Airport = new Airport(customCode,customNameAS, 1000)
        await AirportDao.createCustom( airportJc, userIdJc)
        await AirportDao.createCustom( airportAs, userIdAs)
        // Read for JC
        const listJc = await AirportDao.readList([customCode],userIdJc)
        expect(listJc.length).toBe(1)
        expect(listJc[0].name).toBe(customNameJC)
        // Read for AS
        const listAs = await AirportDao.readList([customCode],userIdAs)
        expect(listAs.length).toBe(1)
        expect(listAs[0].name).toBe(customNameAS)
    })

    test( 'Undefined airport', () => {
        const undefinedAirport = AirportDao.undefinedAirport('TEST')
        expect(undefinedAirport.code).toBe('TEST')
        expect(undefinedAirport.version).toBe(-1)
    })
});

