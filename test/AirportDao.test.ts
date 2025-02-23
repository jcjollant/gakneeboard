
import {describe, expect, test} from '@jest/globals';
import { Airport, versionInvalid } from "../backend/models/Airport.ts"; 
import { AirportDao } from '../backend/AirportDao.ts'
import { jcUserId } from './constants.ts';

require('dotenv').config();

describe('Custom Airports', () => {
    const customCode:string = 'TEST'
    const customNameJC:string = 'Test Airport JC'

    test('read Custom', async () => {
        const customElevation:number = 1000
        const airport:Airport = new Airport(customCode,customNameJC, customElevation)
        
        // Prepare the test by deleting test airports
        await AirportDao.deleteCustom( customCode, jcUserId)

        // Test creation
        await AirportDao.createOrUpdateCustom( airport, jcUserId)
        const customAirportString = await AirportDao.readCustom(customCode, jcUserId)
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
        await AirportDao.createOrUpdateCustom( airportJc, jcUserId)
        await AirportDao.createOrUpdateCustom( airportAs, userIdAs)
        // Read for JC
        const listJc = await AirportDao.readList([customCode],jcUserId)
        expect(listJc.length).toBe(2)
        expect(listJc[0][1].name).toBe(customNameJC)
        // Read for AS
        const listAs = await AirportDao.readList([customCode],userIdAs)
        expect(listAs.length).toBe(2)
        expect(listAs[0][1].name).toBe(customNameAS)
    })

    test( 'Undefined airport', () => {
        const undefinedAirport = AirportDao.undefinedAirport('TEST')
        expect(undefinedAirport.code).toBe('TEST')
        expect(undefinedAirport.version).toBe(versionInvalid)
    })
});

