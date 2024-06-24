import { describe, expect, test} from '@jest/globals';
import { GApi, GApiError } from '../backend/GApi'
import { jcHash, postgresUrl, jcUserId, jcDemoSheet, jcToken, jcName } from './constants'

process.env.POSTGRES_URL=postgresUrl

describe( 'GApi Tests', () => {

    test('Renton is found with both codes', async () => {
        let airport = await GApi.getAirport('RNT')
        expect(airport.code).toBe('KRNT')
        let airport2 = await GApi.getAirport('KRNT')
        expect(airport2.code).toBe('KRNT')
    })

    test('Getting multiple Airports', async () => {
        let list = ['rnt','jfk']
        let airports = await GApi.getAirportsList(list)
        // console.log(airports)
        expect(airports.length).toBe(list.length)
        expect(airports[0].code).toBe('KRNT')
        expect(airports[1].code).toBe('KJFK')

        let list2 = ['jc','pae','jcj']
        airports = await GApi.getAirportsList(list2)
        expect(airports).toHaveLength(list2.length)
        expect(airports[0].code).toBe('JC')
        expect(airports[0].version).toBe(-1)
        expect(airports[1].code).toBe('KPAE')
        expect(airports[1].version).toBe(6)
        expect(airports[2].code).toBe('JCJ')
        expect(airports[2].version).toBe(-1)
    })

    test('Invalid airports list', async() =>{
        let list = ['nt','fk']
        let airports = await GApi.getAirportsList(list)
        // console.log(airports)
        expect(airports).toHaveLength(2)
        expect(airports[0].code).toBe('NT')
        expect(airports[0].version).toBe(-1)
        expect(airports[1].code).toBe('FK')
        expect(airports[1].version).toBe(-1)
    })

    test('Invalid Airport Code', async () => {
        GApi.getAirport('ABCDE').then( () => {
            expect(true).toBe(false) // should not get here
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
            expect(e.status).toBe(400)
        })
        GApi.getAirport('ABCDE', undefined).then( () => {
            expect(true).toBe(false) // should not get here
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
            expect(e.status).toBe(400)
        })
        GApi.getAirport('ABCDE', jcUserId).then( () => {
            expect(true).toBe(false) // should not get here
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
            expect(e.status).toBe(400)
        })
    })

    test('ICAOs are valid', () => {
        expect(GApi.getIcao('KRNTA')).toBeNull()
        expect(GApi.getIcao('KRNT')).toBe('KRNT')
        expect(GApi.getIcao('RNT')).toBe('KRNT')
        expect(GApi.getIcao('NT')).toBeNull()
    })

    test('locId are valid', () => {
        expect(GApi.getLocId('KRNTA')).toBeNull()
        expect(GApi.getLocId('KRNT')).toBe('RNT')
        expect(GApi.getLocId('krnt')).toBe('RNT')
        expect(GApi.getLocId('S43')).toBe('S43')
        expect(GApi.getLocId('NT')).toBeNull()
    })

    test('Militrary frequencies', () => {
        expect(GApi.isMilitary(null)).toBe(false)
        expect(GApi.isMilitary('-.-')).toBe(false)
        expect(GApi.isMilitary('')).toBe(false)
        expect(GApi.isMilitary('121.6')).toBe(false)
        expect(GApi.isMilitary('261.6')).toBe(true)
    })

    test('Update airport', async () => {
        const customRnt = {"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}
        expect(await GApi.createCustomAirport(jcHash,customRnt)).toBe('TEST')
    })

    test('Read custom sheet', async () => {
        const sheet = await GApi.sheetGetData( 1, jcUserId)
        // console.log(JSON.stringify(sheet))
        // console.log(JSON.stringify(jcDemoSheet))
        expect(sheet).toEqual(jcDemoSheet)

        // invalid pageId should throw error
        await GApi.sheetGetData(0,jcUserId).then( () => {
            expect(true).toBe(false) // should not get here
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
        })
    })

    test('Authenticate', async () => {
        const body = { 'source':'google', 'token':jcToken}
        await GApi.authenticate(body).then( user => {
            // console.log(JSON.stringify(user))
            expect(user.id).toBeUndefined()
            expect(user.name).toBe(jcName)
            expect(user.sha256).toBe(jcHash)
            expect(user.sheets).toBeDefined()
            expect(user.sheets.length).toBeGreaterThan(1)
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    test('shaToid', async () => {
        await GApi.userShaToId(jcHash).then( id => {
            expect(id).toBe(jcUserId)
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
        // Bogus Hash should return undefined
        await GApi.userShaToId('bogusHash').then( id => {
            expect(id).toBeUndefined()
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })
})