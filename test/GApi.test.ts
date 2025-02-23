import { describe, expect, test} from '@jest/globals';
import { GApi, GApiError } from '../backend/GApi'
import { jcHash, jcUserId, jcToken, jcName } from './constants'
import { currentAsOf } from './constants';
import { UserMiniView } from '../backend/models/UserMiniView';
import { UserTools } from '../backend/UserTools';

require('dotenv').config();


describe( 'GApi Tests', () => {

    test('Renton is found with both codes', async () => {
        let airport = await GApi.getAirport('RNT')
        expect(airport).toBeDefined()
        expect(airport?.code).toBe('KRNT')
        let airport2 = await GApi.getAirport('KRNT')
        expect(airport2).toBeDefined()
        expect(airport2?.code).toBe('KRNT')
    })

    test('Getting multiple Airports', async () => {
        let list = ['rnt','jfk']
        let airports = await GApi.getAirportViewList(list)
        // console.log(airports)
        expect(airports.length).toBe(list.length)
        expect(airports[0]).toBeDefined()
        expect(airports[0]?.code).toBe('KRNT')
        expect(airports[1]).toBeDefined()
        expect(airports[1]?.code).toBe('KJFK')

        let list2 = ['jc','pae','jcj']
        // console.log(await AirportDao.readList(list2.map( code => code.toUpperCase())))
        // console.log( await GApi.getAirportList(list2))
        airports = await GApi.getAirportViewList(list2)
        // console.log(airports)
        expect(airports).toHaveLength(list2.length)
        expect(airports[0]).toBeDefined()
        expect(airports[0]?.code).toBe('JC')
        expect(airports[0]?.asof).toBe(0)
        expect(airports[1]).toBeDefined()
        expect(airports[1]?.code).toBe('KPAE')
        expect(airports[1]?.asof).toBe(currentAsOf)
        expect(airports[2]).toBeDefined()
        expect(airports[2]?.code).toBe('JCJ')
        expect(airports[2]?.asof).toBe(0)
    })

    test('Invalid airports list', async() =>{
        let list = ['nt','fk']
        let airports = await GApi.getAirportViewList(list)
        // console.log(airports)
        expect(airports).toHaveLength(2)
        expect(airports[0]).toBeDefined()
        expect(airports[0]?.code).toBe('NT')
        expect(airports[0]?.asof).toBe(0)
        expect(airports[1]).toBeDefined()
        expect(airports[1]?.code).toBe('FK')
        expect(airports[1]?.asof).toBe(0)
    })

    test('Invalid Airport Code', async () => {
        GApi.getAirport('ABCDE').then( () => {
            expect(true).toBe(false) // should not get here
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
            expect(e.status).toBe(400)
        })

        GApi.getAirportView('ABCDE').then( () => {
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
        expect(GApi.isMilitary('-.-')).toBe(false)
        expect(GApi.isMilitary('')).toBe(true)
        expect(GApi.isMilitary('117')).toBe(true)
        expect(GApi.isMilitary('121.6')).toBe(false)
        expect(GApi.isMilitary('261.6')).toBe(true)
    })

    test('Update airport', async () => {
        const customRnt = {"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}
        expect(await GApi.createCustomAirport(jcHash,customRnt)).toBe('TEST')
    })

    test('Get Custom airport', async () => {
        const airport = await GApi.getAirportView("TEST", jcUserId)
        // console.log(airport)
        expect(airport).toBeDefined()
        expect(airport?.code).toBe('TEST') 
    })

    test('Authenticate', async () => {
        const body = { 'source':UserTools.google, 'token':jcToken}
        await GApi.authenticate(body).then( (user:UserMiniView) => {
            // console.log(JSON.stringify(user))
            expect(user.name).toBe(jcName)
            expect(user.sha256).toBe(jcHash)
            expect(user.templates).toBeDefined()
            expect(user.templates.length).toBeGreaterThan(1)
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

    test('Sunlight', async () => {
        await GApi.getSunlight('KRNT', 'KSFF', 20240717).then( data => {
            expect(data).toBeDefined()
            expect(data?.dateFrom).toBe('2024-07-17')
            expect(data?.dateTo).toBe('2024-07-17')
            expect(data?.sunrise).toBe('5:29:46 AM')
            expect(data?.sunset).toBe('8:43:31 PM') // KSFF
            expect(data?.civilTwilight.am).toBe('4:51:22 AM')
            expect(data?.civilTwilight.pm).toBe('9:22:09 PM')
            expect(data?.solarNoon).toBe('1:16:03 PM')
            expect(data?.goldenHour).toBe('7:56:53 PM')
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    test('Sunlight Overnight', async () => {
        await GApi.getSunlight('KRNT', 'KSFF', 20240717, 20240718).then( data => {
            expect(data).toBeDefined()
            expect(data?.dateFrom).toBe('2024-07-17')
            expect(data?.dateTo).toBe('2024-07-18')
            expect(data?.sunrise).toBe('5:10:30 AM') // KSFF
            expect(data?.sunset).toBe('9:02:20 PM') // KRNT
            expect(data?.civilTwilight.am).toBe('4:32:01 AM') // KSFF 07-18
            expect(data?.civilTwilight.pm).toBe('9:40:44 PM') // KRNT 07-17
            expect(data?.solarNoon).toBe('1:16:03 PM') // KRNT
            expect(data?.goldenHour).toBe('7:56:07 PM') // KSFF

            // KRNT {"results":{"date":"2024-07-17","sunrise":"5:29:46 AM","sunset":"9:02:20 PM","first_light":"2:51:17 AM","last_light":"11:40:50 PM","dawn":"4:51:22 AM","dusk":"9:40:44 PM","solar_noon":"1:16:03 PM","golden_hour":"8:15:55 PM","day_length":"15:32:33","timezone":"America/Los_Angeles","utc_offset":-420},"status":"OK"}
            // KSFF {"results":{"date":"2024-07-18","sunrise":"5:10:30 AM","sunset":"8:42:38 PM","first_light":"2:31:36 AM","last_light":"11:21:32 PM","dawn":"4:32:01 AM","dusk":"9:21:07 PM","solar_noon":"12:56:34 PM","golden_hour":"7:56:07 PM","day_length":"15:32:08","timezone":"America/Los_Angeles","utc_offset":-420},"status":"OK"}            
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    test('Current Effective Date', () => {
        expect(GApi.getAirportCurrentEffectiveDate()).toBe(currentAsOf)
    })

    test('Session', async () => {
        const req1 = {}
        const session1 = await GApi.getSession(req1)
        expect(session1).toBeDefined()
        expect(session1.version).toBeDefined()
        expect(session1.aced).toBeDefined()
        expect(session1.camv).toBeDefined()
        expect(session1.user).toBeUndefined()
        const req2 = { query: { user: jcHash}}
        const session2 = await GApi.getSession(req2)
        expect(session2).toBeDefined()
        expect(session2.version).toBeDefined()
        expect(session2.aced).toBeDefined()
        expect(session2.camv).toBeDefined()
        expect(session2.user).toBeDefined()

    })
})