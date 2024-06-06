import {describe, expect, test} from '@jest/globals';
import { Airport } from '../backend/Airport';
import { CustomAirport } from '../backend/CustomAirport';

process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"

describe( 'CustomAirport', () => {
    test('getId', () => {
        expect( CustomAirport.getId('abc',1)).toBe('ABC-1')
        expect( CustomAirport.getId('aBcD',1)).toBe('ABCD-1')
        expect( () => CustomAirport.getId('ab',1)).toThrow('Invalid airport code')
        expect( () => CustomAirport.getId('abcde',1)).toThrow('Invalid airport code')
    })

    test('Update should create if not existent', async () => {
        const userId = 1; // JC
        const airportId = CustomAirport.getId('test', userId)
        expect(await CustomAirport.count()).toBe(0)

        CustomAirport.delete( airportId)
        const airport = new Airport('test','Test Airport', 0)
        console.log( "airport " + JSON.stringify( airport))
        CustomAirport.update( airport, userId)
    })
}) 