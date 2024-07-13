import {describe, expect, test} from '@jest/globals';
import { Airport } from '../backend/models/Airport';
import { AirportView } from '../backend/models/AirportView';

describe( 'Airport View', () => {
    test( 'Undefined constructor', () => {
        const undefinedView = new AirportView(undefined)
        expect(undefinedView).toBeDefined()
        expect(undefinedView.version).toBe(-1)
    })

    test('undefined view', () => {
        const airportCode = 'code'
        const undefinedView = AirportView.getUndefined(airportCode)
        expect(undefinedView).toBeDefined()
        expect(undefinedView.code).toBe(airportCode)
        expect(undefinedView.version).toBe(-1)
    })

    test('Defined view', () => {
        const airportCode = 'code'
        const airportName = 'name'
        const airportElevation = 1234
        const airport = new Airport( airportCode, airportName, airportElevation)
        const view = new AirportView(airport)
        expect(view).toBeDefined() 
        expect(view.version).toBe(AirportView.currentVersion)
        expect(view.code).toBe(airportCode) 
        expect(view.name).toBe(airportName)
        expect(view.freq).toHaveLength(0)
        expect(view.rwys).toHaveLength(0)
        expect(view.custom).toBeFalsy()
    })
})