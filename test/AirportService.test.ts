import { describe, expect, it, jest, test } from '@jest/globals';
import { AirportService } from '../backend/services/AirportService'
import { currentAsOf, jcUserId } from './constants';
import { AirportSketch } from '../backend/AirportSketch';
import { AirportCreationRequest } from '../backend/models/AirportCreationRequest';
import { CodeAndAirport } from '../backend/models/CodeAndAirport';
import { Adip } from '../backend/adip/Adip';
import { AirportDao } from '../backend/AirportDao';
import { Airport, AirportSource } from '../backend/models/Airport';
import { GApiError } from '../backend/GApiError';
import * as cnf4 from './jsonData/airport/cnf4Creation.json';

describe('AirportService Tests', () => {

    test('Clean up codes', () => {
        const input = ["JCJ", "jCj", " jCj ", " j#Cj ", "JCJ;", "JCJ'"]
        const expected = ["JCJ", "JCJ", "JCJ", "JCJ", "JCJ", "JCJ"]
        expect(AirportService.cleanUpCodes(input)).toEqual(expected)
    })

    test('Getting multiple Airports', async () => {
        let list = ['rnt', 'jfk']
        jest.spyOn(AirportSketch, 'get').mockResolvedValue(AirportSketch.doesNotExist)

        // Mock getAirportList
        const rnt = new Airport('KRNT', 'Renton', 42)
        const jfk = new Airport('KJFK', 'Kennedy', 12)
        jest.spyOn(AirportService, 'getAirportList').mockResolvedValue([
            new CodeAndAirport('KRNT', rnt),
            new CodeAndAirport('KJFK', jfk)
        ])

        let airports = await AirportService.getAirportViewList(list)
        // console.log(airports)
        expect(airports.length).toBe(list.length)
        expect(airports[0]).toBeDefined()
        expect(airports[0]?.code).toBe('KRNT')
        expect(airports[1]).toBeDefined()
        expect(airports[1]?.code).toBe('KJFK')

        let list2 = ['jc', 'pae', 'jcj']

        jest.spyOn(AirportService, 'getAirportList').mockResolvedValue([
            new CodeAndAirport('JC', new Airport('JC', 'JC Airport', 0)),
            new CodeAndAirport('KPAE', new Airport('KPAE', 'Paine Field', 0)),
            new CodeAndAirport('JCJ', new Airport('JCJ', 'JCJ', 0))
        ])

        jest.spyOn(AirportSketch, 'get').mockResolvedValue(AirportSketch.doesNotExist)
        airports = await AirportService.getAirportViewList(list2)
        // console.log(airports)
        expect(airports).toHaveLength(list2.length)
        expect(airports[0]).toBeDefined()
        expect(airports[0]?.code).toBe('JC')
        expect(airports[0]?.asof).toBe(0)
        expect(airports[1]).toBeDefined()
        expect(airports[1]?.code).toBe('KPAE')
        expect(airports[2]).toBeDefined()
        expect(airports[2]?.code).toBe('JCJ')
        expect(airports[2]?.asof).toBe(0)
    })

    test('Invalid airports list', async () => {
        let list = ['nt', 'fk']
        jest.spyOn(AirportSketch, 'get').mockResolvedValue(AirportSketch.doesNotExist)

        jest.spyOn(AirportService, 'getAirportList').mockResolvedValue([
            new CodeAndAirport('NT', undefined), // Using undefined(code) factory? CodeAndAirport.undefined('NT')
            new CodeAndAirport('FK', undefined)
        ])

        let airports = await AirportService.getAirportViewList(list)
        // console.log(airports)
        expect(airports).toHaveLength(2)
        expect(airports[0]).toBeDefined()
        expect(airports[0]?.code).toBe('NT')
        expect(airports[0]?.asof).toBe(0)
        expect(airports[1]).toBeDefined()
        expect(airports[1]?.code).toBe('FK')
        expect(airports[1]?.asof).toBe(0)
    })

    test('ICAOs are valid', () => {
        expect(AirportService.getIcao('KRNTA')).toBeNull()
        expect(AirportService.getIcao('KRNT')).toBe('KRNT')
        expect(AirportService.getIcao('RNT')).toBe('KRNT')
        expect(AirportService.getIcao('NT')).toBeNull()
    })

    test('locId are valid', () => {
        expect(AirportService.getLocId('KRNTA')).toBeNull()
        expect(AirportService.getLocId('KRNT')).toBe('RNT')
        expect(AirportService.getLocId('krnt')).toBe('RNT')
        expect(AirportService.getLocId('S43')).toBe('S43')
        expect(AirportService.getLocId('NT')).toBeNull()
    })

    test('Militrary frequencies', () => {
        expect(AirportService.isMilitary('-.-')).toBe(false)
        expect(AirportService.isMilitary('')).toBe(true)
        expect(AirportService.isMilitary('117')).toBe(true)
        expect(AirportService.isMilitary('121.6')).toBe(false)
        expect(AirportService.isMilitary('261.6')).toBe(true)
    })

    // test('Update airport', async () => {
    //     const customRnt = {"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}
    //     expect(await AirportService.createCustomAirport(jcHash,customRnt)).toBe('TEST')
    // })

    test('Get Custom airport', async () => {
        jest.spyOn(AirportSketch, 'get').mockResolvedValue(AirportSketch.doesNotExist)

        jest.spyOn(AirportService, 'getAirportList').mockResolvedValue([
            new CodeAndAirport('TEST', new Airport('TEST', 'Test Airport', 0))
        ])

        const airport = await AirportService.getAirportView("TEST", jcUserId)
        // console.log(airport)
        expect(airport).toBeDefined()
        expect(airport?.code).toBe('TEST')
    })

    // Disabled as this is always changing
    // test('Current Effective Date', () => {
    //     expect(AirportService.getAirportCurrentEffectiveDate()).toBe(currentAsOf)
    // })

    describe('getAirport', () => {
        it('Handles invalid code', async () => {
            await expect(AirportService.getAirport('')).rejects.toEqual(new GApiError(400, 'Invalid Airport Code'));
            await expect(AirportService.getAirport('A')).rejects.toEqual(new GApiError(400, 'Invalid Airport Code'));
            await expect(AirportService.getAirport('ABCDE')).rejects.toEqual(new GApiError(400, 'Invalid Airport Code'));
        })

        it('Handles unknown codes with or w/o user', async () => {
            jest.spyOn(AirportService, 'getAirportList').mockResolvedValue([])
            const output = await AirportService.getAirport('ABCD')
            expect(output).toBeUndefined()

            const output2 = await AirportService.getAirport('ABCD', undefined)
            expect(output2).toBeUndefined()

            const output3 = await AirportService.getAirport('ABCD', jcUserId)
            expect(output3).toBeUndefined()
        })
    })

    describe('getAirportCurent', () => {
        it('Deals with invalid codes', async () => {
            jest.spyOn(AirportSketch, 'get').mockResolvedValue('')
            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(undefined)

            // invalid code should be undefined
            const invalidCode = 'ABCDEFGH'
            expect(await AirportService.getAirportCurrent(invalidCode, [])).toEqual(new CodeAndAirport(invalidCode))
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
            expect(await AirportService.getAirportCurrent(validCode, [])).toEqual(new CodeAndAirport(validCode))
            // Adip should be called once
            expect(AirportDao.createUnknown).toBeCalledTimes(1)
            expect(AirportDao.createUnknown).toBeCalledWith(validCode)
            expect(AirportSketch.get).toBeCalledTimes(0)

        })

        it('Gets a new valid airport', async () => {
            jest.resetAllMocks()
            jest.spyOn(AirportSketch, 'get').mockResolvedValue('')
            jest.spyOn(AirportSketch, 'resolve').mockResolvedValue(undefined)

            const validCode = 'KBFI'
            // Code is valid and airport is found in adip
            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(undefined)
            const mockBoeing = new Airport(validCode, "Boieng Field", 42)
            // Default source is Adip, but let's be explicit if needed or just verify default.
            // validMock.source is initialized to Adip in constructor.

            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(mockBoeing)
            jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)
            expect(await AirportService.getAirportCurrent(validCode, [])).toEqual(new CodeAndAirport(validCode, mockBoeing))
            expect(AirportDao.create).toBeCalledTimes(1)
            // Verify specific fields including source
            expect(AirportDao.create).toBeCalledWith(validCode, expect.objectContaining({
                code: validCode,
                source: AirportSource.Adip
            }))

        })

        it('Deals with custom, current and known unknows', async () => {
            jest.resetAllMocks()
            const mockCode = "CUST"
            const mockCustom = new Airport(mockCode, "Mock Custom", 42)
            mockCustom.custom = true
            const mockCaa = new CodeAndAirport(mockCode, mockCustom)
            const currentCode = "RNT"
            const currentAirport = new Airport(currentCode, "Current Renton", 42)
            currentAirport.effectiveDate = Adip.currentEffectiveDate()
            const currentCaa = new CodeAndAirport(currentCode, currentAirport)
            const kuCode = 'KUNK'
            const kuCaa = CodeAndAirport.undefined(kuCode)
            const knownAirports = [mockCaa, currentCaa, kuCaa]

            jest.spyOn(Adip, 'fetchAirport').mockResolvedValue(undefined)
            expect(await AirportService.getAirportCurrent(mockCode, knownAirports)).toEqual(mockCaa)
            expect(await AirportService.getAirportCurrent(currentCode, knownAirports)).toEqual(currentCaa)
            expect(await AirportService.getAirportCurrent(kuCode, knownAirports)).toEqual(kuCaa)
            expect(Adip.fetchAirport).toBeCalledTimes(0)
            expect(await AirportService.getAirportCurrent(kuCode, knownAirports)).toEqual(kuCaa)
            expect(Adip.fetchAirport).toBeCalledTimes(0)
        })
    })

    describe('createAirport', () => {
        it('Creates a new airport', async () => {
            const request: AirportCreationRequest = {
                code: 'KNW',
                name: 'New Airport',
                elevation: 100,
                trafficPatternAltitude: 1000,
                frequencies: [],
                runways: []
            }
            const expectedAirport = new Airport('KNW', 'New Airport', 100)
            expectedAirport.tpa = 1000
            expectedAirport.freq = []
            expectedAirport.rwys = []
            expectedAirport.version = Airport.currentVersion

            jest.spyOn(Adip, 'currentEffectiveDate').mockReturnValue('20250101')
            jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)

            const result = await AirportService.createAirport(request)

            expect(result.code).toBe('KNW')
            expect(result.name).toBe('New Airport')
            expect(result.effectiveDate).toBe('20250101')
            expect(result.source).toBe(AirportSource.User)
            expect(AirportDao.create).toHaveBeenCalledWith('KNW', expect.objectContaining({
                code: 'KNW',
                name: 'New Airport',
                source: AirportSource.User
            }))
        })

        it('Rejects invalid code', async () => {
            const request: AirportCreationRequest = {
                code: 'INVALID',
                name: 'Invalid Airport',
                elevation: 100,
                trafficPatternAltitude: 1000,
                frequencies: [],
                runways: []
            }
            try {
                await AirportService.createAirport(request)
                throw new Error('Should have thrown')
            } catch (e: any) {
                expect(e.status).toBe(400)
                expect(e.message).toBe("Invalid Airport Code")
            }
        })
    })

    it('Creates a new airport from fixture', async () => {
        const request = cnf4 as unknown as AirportCreationRequest;
        jest.spyOn(Adip, 'currentEffectiveDate').mockReturnValue('20250101')
        jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)

        const result = await AirportService.createAirport(request)

        expect(result.code).toBe(cnf4.code)
        expect(result.name).toBe(cnf4.name)
        expect(result.elev).toBe(cnf4.elevation)
        expect(result.tpa).toBe(cnf4.trafficPatternAltitude)
        expect(result.freq).toEqual(cnf4.frequencies)
        expect(result.rwys.length).toBe(cnf4.runways.length)
        expect(result.rwys[0].name).toBe(cnf4.runways[0].name)
        expect(result.rwys[0].ends.length).toBe(2)
        expect(result.rwys[0].width).toBe(cnf4.runways[0].width)
        expect(result.source).toBe(AirportSource.User)
        expect(AirportDao.create).toHaveBeenCalledWith(cnf4.code, expect.anything())
    })
})
