
import {describe, expect, test} from '@jest/globals';
import { Airport, Runway } from "../backend/models/Airport.ts"; 
import { AirportDao } from '../backend/AirportDao.ts'

process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"

describe('AirportDao', () => {
    test('Custom Airport', async () => {
        const userId = 1; // JC
        const customCode:string = 'TEST'
        const customName:string = 'Test Airport'
        const customElevation:number = 1000
        const airport:Airport = new Airport(customCode,customName, customElevation)
        
        // Prepare the test by deleting test airports
        await AirportDao.deleteCustom( customCode, userId)

        // Test creation
        await AirportDao.createCustom( airport, userId)
        const customAirportString = await AirportDao.readCustom(customCode, userId)
        expect(customAirportString).toBeDefined()
        if(customAirportString !== undefined) {
            let customAirport = JSON.parse(customAirportString)
            expect(customAirport.code).toBe(customCode)
            expect(customAirport.name).toBe(customName)
            expect(customAirport.elev).toBe(customElevation)
        }

        // Test deletion
        // AirportDao.deleteCustom( customCode, userId)

        // console.log( "airport " + JSON.stringify( airport))
        // AirportDAO.updateCustom( airport, userId)
    })
});

