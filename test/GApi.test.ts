import { describe, expect, it, jest, test} from '@jest/globals';
import { GApi, GApiError } from '../backend/GApi'
import { jcHash, jcUserId, jcToken, jcName } from './constants'
import { currentAsOf } from './constants';
import { UserMiniView } from '../backend/models/UserMiniView';
import { UserTools } from '../backend/UserTools';
import { AirportSketch } from '../backend/AirportSketch';
import { CodeAndAirport } from '../backend/models/CodeAndAirport';
import { Adip } from '../backend/adip/Adip';
import { AirportDao } from '../backend/AirportDao';
import { Airport } from '../backend/models/Airport';

import * as dotenv from 'dotenv'
dotenv.config()

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
        jest.spyOn(AirportSketch,'get').mockResolvedValue(AirportSketch.doesNotExist)
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
        jest.spyOn(AirportSketch,'get').mockResolvedValue(AirportSketch.doesNotExist)
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
        jest.spyOn(AirportSketch,'get').mockResolvedValue(AirportSketch.doesNotExist)
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
        jest.spyOn(AirportSketch,'get').mockResolvedValue(AirportSketch.doesNotExist)
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

    describe('getAirportCurent', () => {
        it('Deals with invalid codes', async() => {
            jest.spyOn(AirportSketch, 'get').mockResolvedValue('')
            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(undefined)

            // invalid code should be undefined
            const invalidCode = 'ABCDEFGH'
            expect( await GApi.getAirportCurrent(invalidCode, [])).toEqual( new CodeAndAirport(invalidCode))
            expect(Adip.fetchAirport).toBeCalledTimes(0)
            expect(AirportSketch.get).toBeCalledTimes(0)
        })

        it('Code is valid but airport doesnt exist', async () => {
            jest.resetAllMocks()
            jest.spyOn(AirportSketch, 'get').mockResolvedValue('')
            
            // Airport not found in adip
            const validCode = 'RNT'
            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(undefined)
            jest.spyOn(AirportDao, 'createUnknown').mockResolvedValue(undefined)
            expect( await GApi.getAirportCurrent(validCode, [])).toEqual( new CodeAndAirport(validCode))
            // Adip should be called once
            expect(AirportDao.createUnknown).toBeCalledTimes(1)
            expect(AirportDao.createUnknown).toBeCalledWith(validCode)
            expect(AirportSketch.get).toBeCalledTimes(0)

        })

        it('Gets a new valid airport', async () => {
            jest.resetAllMocks()
            jest.spyOn(AirportSketch, 'get').mockResolvedValue('')

            const validCode = 'KBFI'
            // Code is valid and airport is found in adip
            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(undefined)
            const mockBoeing = new Airport(validCode, "Boieng Field", 42)
            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(mockBoeing)
            jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)
            expect( await GApi.getAirportCurrent(validCode, [])).toEqual( new CodeAndAirport(validCode, mockBoeing))
            expect(AirportDao.create).toBeCalledTimes(1)
            expect(AirportDao.create).toBeCalledWith(validCode, mockBoeing)

        })

        it('Deals with custom, current and known unknows', async () => {
            jest.resetAllMocks()
            const mockCode = "CUST"
            const mockCustom = new Airport( mockCode, "Mock Custom", 42)
            mockCustom.custom = true
            const mockCaa = new CodeAndAirport(mockCode, mockCustom)
            const currentCode = "RNT"
            const currentAirport = new Airport(currentCode, "Current Renton", 42)
            currentAirport.effectiveDate = Adip.currentEffectiveDate
            const currentCaa = new CodeAndAirport(currentCode, currentAirport)
            const kuCode = 'KUNK'
            const kuCaa = CodeAndAirport.undefined( kuCode)
            const knownAirports = [mockCaa, currentCaa, kuCaa]

            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(undefined)
            expect( await GApi.getAirportCurrent(mockCode, knownAirports)).toEqual( mockCaa)
            expect( await GApi.getAirportCurrent(currentCode, knownAirports)).toEqual( currentCaa)
            expect( await GApi.getAirportCurrent(kuCode, knownAirports)).toEqual( kuCaa)
            expect(Adip.fetchAirport).toBeCalledTimes(0)
        })
    })
})


