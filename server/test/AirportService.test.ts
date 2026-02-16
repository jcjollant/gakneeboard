import { describe, expect, it, jest, test, beforeEach, afterAll } from '@jest/globals';
import { AirportService } from '../backend/services/AirportService'
import { currentAsOf, jcUserId } from './constants';
import { AirportSketch } from '../backend/AirportSketch';
import { AirportCreationRequest } from '../backend/models/AirportCreationRequest';
import { CodeAndAirport } from '../backend/models/CodeAndAirport';
import { AdipService } from '../backend/services/AdipService';
import { AirportDao } from '../backend/AirportDao';
import { Airport, AirportSource } from '../backend/models/Airport';
import { GApiError } from '../backend/GApiError';
import * as cnf4 from './jsonData/airport/cnf4Creation.json';

describe('AirportService Tests', () => {

    test('Clean up codes', () => {
        const input = ["JCJ", "jCj", " jCj ", " j#Cj ", "JCJ;", "JCJ'"]
        const expected = { valid: ["JCJ", "JCJ", "JCJ", "JCJ", "JCJ", "JCJ"], invalid: [] }
        expect(AirportService.cleanUpCodes(input)).toEqual(expected)
    })

    test('Airport code validation', () => {
        // too long
        expect(AirportService.isValidCode("JCJCJ")).toBeFalsy()
        // just right x 2
        expect(AirportService.isValidCode("JCJC")).toBeTruthy()
        expect(AirportService.isValidCode("JCJ")).toBeTruthy()
        // too short all the way down
        expect(AirportService.isValidCode("JC")).toBeFalsy()
        expect(AirportService.isValidCode("J")).toBeFalsy()
        expect(AirportService.isValidCode("")).toBeFalsy()
    })

    test('Getting multiple Airports', async () => {
        let list = ['rnt', 'jfk']
        jest.spyOn(AirportSketch, 'get').mockResolvedValue(AirportSketch.doesNotExist)

        // Mock getAirportList
        const rnt = new Airport('KRNT', undefined, 'Renton', 42)
        const jfk = new Airport('KJFK', undefined, 'Kennedy', 12)
        jest.spyOn(AirportService, 'getAirports').mockResolvedValue([
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

        jest.spyOn(AirportService, 'getAirports').mockResolvedValue([
            new CodeAndAirport('JC', new Airport('JC', undefined, 'JC Airport', 0)),
            new CodeAndAirport('KPAE', new Airport('KPAE', undefined, 'Paine Field', 0)),
            new CodeAndAirport('JCJ', new Airport('JCJ', undefined, 'JCJ', 0))
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

        jest.spyOn(AirportService, 'getAirports').mockResolvedValue([
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

        jest.spyOn(AirportService, 'getAirports').mockResolvedValue([
            new CodeAndAirport('TEST', new Airport('TEST', undefined, 'Test Airport', 0))
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
            jest.spyOn(AirportService, 'getAirports').mockResolvedValue([])
            const output = await AirportService.getAirport('ABCD')
            expect(output).toBeUndefined()

            const output2 = await AirportService.getAirport('ABCD', undefined)
            expect(output2).toBeUndefined()

            const output3 = await AirportService.getAirport('ABCD', jcUserId)
            expect(output3).toBeUndefined()
        })
    })

    describe('getAirports', () => {
        beforeEach(() => {
            jest.restoreAllMocks()
        })

        afterAll(() => {
            jest.restoreAllMocks()
        })

        it('Handles invalid codes', async () => {
            jest.resetAllMocks()
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [], notFound: [] })
            jest.spyOn(AirportDao, 'createUnknown').mockResolvedValue(undefined)

            const invalidCodes = ['AB', 'TOOLONG', 'X']
            const result = await AirportService.getAirports(invalidCodes)

            expect(result).toHaveLength(3)
            expect(result[0]).toEqual(CodeAndAirport.undefined('AB'))
            expect(result[1]).toEqual(CodeAndAirport.undefined('TOOLONG'))
            expect(result[2]).toEqual(CodeAndAirport.undefined('X'))
            expect(AirportDao.createUnknown).toBeCalledTimes(3)
        })

        it('Handles valid codes not found in ADIP', async () => {
            jest.resetAllMocks()
            const validCode = 'KXYZ'
            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [], notFound: [validCode] })
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(undefined)
            jest.spyOn(AirportDao, 'createUnknown').mockResolvedValue(undefined)
            jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)

            const result = await AirportService.getAirports([validCode])

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(CodeAndAirport.undefined(validCode))
            expect(AirportDao.createUnknown).toBeCalledTimes(1)
            expect(AirportDao.createUnknown).toBeCalledWith(validCode)
            expect(AirportDao.create).toBeCalledTimes(0)
        })

        it('Fetches and saves new valid airports from ADIP', async () => {
            jest.resetAllMocks()
            const validCode = 'KBFI'
            const mockBoeing = new Airport(validCode, undefined, "Boeing Field", 42)

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [], notFound: [validCode] })
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(mockBoeing)
            jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)
            jest.spyOn(AirportSketch, 'resolve').mockResolvedValue(undefined)

            const result = await AirportService.getAirports([validCode])

            expect(result).toHaveLength(1)
            expect(result[0].code).toBe(validCode)
            expect(result[0].airport).toEqual(mockBoeing)
            expect(AirportDao.create).toBeCalledTimes(1)
            expect(AirportDao.create).toBeCalledWith(mockBoeing)
            expect(AirportSketch.resolve).toBeCalledTimes(1)
            expect(AirportSketch.resolve).toBeCalledWith(mockBoeing, validCode, true)
        })

        it('Handles custom airports without refresh', async () => {
            jest.resetAllMocks()
            const customCode = "CUST"
            const customAirport = new Airport(customCode, undefined, "Custom Airport", 42)
            customAirport.custom = true
            const customCaa = new CodeAndAirport(customCode, customAirport)

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [customCaa], knownUnknown: [], notFound: [] })
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(undefined)

            const result = await AirportService.getAirports([customCode])

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(customCaa)
            expect(AdipService.prototype.fetchAirport).toBeCalledTimes(0)
        })

        it('Handles current airports without refresh', async () => {
            jest.resetAllMocks()
            const currentCode = "KRNT"
            const currentAirport = new Airport(currentCode, undefined, "Current Renton", 42)
            currentAirport.effectiveDate = AdipService.currentEffectiveDate()
            currentAirport.version = Airport.currentVersion
            const currentCaa = new CodeAndAirport(currentCode, currentAirport)

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [currentCaa], knownUnknown: [], notFound: [] })
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(undefined)
            jest.spyOn(AdipService.prototype, 'airportIsStale').mockResolvedValue(false)

            const result = await AirportService.getAirports([currentCode])

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(currentCaa)
            expect(AdipService.prototype.fetchAirport).toBeCalledTimes(0)
        })

        it('Handles known unknown airports', async () => {
            jest.resetAllMocks()
            const unknownCode = 'XYZ'
            const unknownAirport = new Airport(unknownCode, undefined, '', 0)
            unknownAirport.version = -1 // versionInvalid
            const unknownCaa = new CodeAndAirport(unknownCode, unknownAirport)

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [], knownUnknown: [unknownCaa], notFound: [] })
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(undefined)

            const result = await AirportService.getAirports([unknownCode])

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(CodeAndAirport.undefined(unknownCode))
            expect(AdipService.prototype.fetchAirport).toBeCalledTimes(0)
        })

        it('Refreshes stale airports and preserves sketches', async () => {
            jest.resetAllMocks()
            const staleCode = "KRNT"
            const staleAirport = new Airport(staleCode, undefined, "Stale Renton", 42)
            staleAirport.effectiveDate = "20200101"
            staleAirport.version = Airport.currentVersion
            staleAirport.sketch = "existing-sketch-url"
            const staleCaa = new CodeAndAirport(staleCode, staleAirport)

            const refreshedAirport = new Airport(staleCode, undefined, "Refreshed Renton", 42)
            refreshedAirport.effectiveDate = AdipService.currentEffectiveDate()

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [staleCaa], knownUnknown: [], notFound: [] })
            jest.spyOn(AdipService.prototype, 'airportIsStale').mockResolvedValue(true)
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(refreshedAirport)
            jest.spyOn(AirportDao, 'updateAirport').mockResolvedValue(undefined)

            const result = await AirportService.getAirports([staleCode])

            expect(result).toHaveLength(1)
            expect(result[0].code).toBe(staleCode)
            expect(result[0].airport.sketch).toBe("existing-sketch-url")
            expect(AirportDao.updateAirport).toBeCalledTimes(1)
            expect(AirportDao.updateAirport).toBeCalledWith(staleCaa.airport.id, expect.objectContaining({
                code: staleCode,
                name: "Refreshed Renton"
            }))
        })

        it('Updates sketches for refreshed airports without existing sketches', async () => {
            jest.resetAllMocks()
            const staleCode = "KRNT"
            const staleAirport = new Airport(staleCode, undefined, "Stale Renton", 42)
            staleAirport.effectiveDate = "20200101"
            staleAirport.version = Airport.currentVersion
            staleAirport.id = 123
            // No sketch
            const staleCaa = new CodeAndAirport(staleCode, staleAirport)

            const refreshedAirport = new Airport(staleCode, undefined, "Refreshed Renton", 42)
            refreshedAirport.effectiveDate = AdipService.currentEffectiveDate()

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [staleCaa], knownUnknown: [], notFound: [] })
            jest.spyOn(AdipService.prototype, 'airportIsStale').mockResolvedValue(true)
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(refreshedAirport)
            jest.spyOn(AirportDao, 'updateAirport').mockResolvedValue(undefined)
            jest.spyOn(AirportSketch, 'resolve').mockResolvedValue(undefined)

            const result = await AirportService.getAirports([staleCode])

            expect(result).toHaveLength(1)
            expect(AirportSketch.resolve).toBeCalledTimes(1)
            expect(AirportSketch.resolve).toBeCalledWith(refreshedAirport, staleCode, true)
        })

        it('Reproduction: Refreshes stale airports and passes valid ID to update', async () => {
            jest.resetAllMocks()
            const staleCode = "KRNT"
            const staleId = 999
            const staleAirport = new Airport(staleCode, undefined, "Stale Renton", 42)
            staleAirport.effectiveDate = "20200101"
            staleAirport.version = Airport.currentVersion
            staleAirport.id = staleId
            staleAirport.sketch = "existing-sketch-url"
            const staleCaa = new CodeAndAirport(staleCode, staleAirport)

            const refreshedAirport = new Airport(staleCode, undefined, "Refreshed Renton", 42)
            refreshedAirport.effectiveDate = AdipService.currentEffectiveDate()

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({ known: [staleCaa], knownUnknown: [], notFound: [] })
            jest.spyOn(AdipService.prototype, 'airportIsStale').mockResolvedValue(true)
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(refreshedAirport)
            jest.spyOn(AirportDao, 'updateAirport').mockResolvedValue(undefined)
            jest.spyOn(AirportSketch, 'resolve').mockResolvedValue(undefined)

            await AirportService.getAirports([staleCode])

            // The critical assertion: ID must be 999, not undefined
            expect(AirportDao.updateAirport).toBeCalledWith(staleId, expect.anything())
        })

        it('Processes multiple codes in batch', async () => {
            jest.resetAllMocks()
            const newCode = 'KBFI'
            const currentCode = 'KRNT'
            const invalidCode = 'XY'

            const newAirport = new Airport(newCode, undefined, "Boeing Field", 42)
            const currentAirport = new Airport(currentCode, undefined, "Renton", 42)
            currentAirport.effectiveDate = AdipService.currentEffectiveDate()
            currentAirport.version = Airport.currentVersion
            const currentCaa = new CodeAndAirport(currentCode, currentAirport)

            jest.spyOn(AirportDao, 'codesLookup').mockResolvedValue({
                known: [currentCaa],
                knownUnknown: [],
                notFound: [newCode]
            })
            jest.spyOn(AdipService.prototype, 'fetchAirport').mockResolvedValue(newAirport)
            jest.spyOn(AdipService.prototype, 'airportIsStale').mockResolvedValue(false)
            jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)
            jest.spyOn(AirportDao, 'createUnknown').mockResolvedValue(undefined)
            jest.spyOn(AirportSketch, 'resolve').mockResolvedValue(undefined)

            const result = await AirportService.getAirports([newCode, currentCode, invalidCode])

            expect(result).toHaveLength(3)
            // New airport
            expect(result[0].code).toBe(newCode)
            expect(result[0].airport).toEqual(newAirport)
            // Current airport
            expect(result[1].code).toBe(currentCode)
            expect(result[1].airport).toEqual(currentAirport)
            // Invalid code
            expect(result[2]).toEqual(CodeAndAirport.undefined(invalidCode))
        })
    })

    describe('createAirport', () => {
        it('Creates a new airport', async () => {
            const request: AirportCreationRequest = {
                icaoId: 'KNEW',
                name: 'New Airport',
                elevation: 100,
                trafficPatternAltitude: 1000,
                frequencies: [],
                runways: []
            }
            const expectedAirport = new Airport('KNEW', undefined, 'New Airport', 100)
            expectedAirport.tpa = 1000
            expectedAirport.freq = []
            expectedAirport.rwys = []
            expectedAirport.version = Airport.currentVersion

            jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue('20250101')
            jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)

            const result = await AirportService.createAirport(request)

            expect(result.code).toBe('KNEW')
            expect(result.name).toBe('New Airport')
            expect(result.effectiveDate).toBe('20250101')
            expect(result.source).toBe(AirportSource.User)
            expect(AirportDao.create).toHaveBeenCalledWith(expect.objectContaining({
                icaoId: 'KNEW',
                name: 'New Airport',
                source: AirportSource.User
            }))
        })

        it('Rejects invalid code', async () => {
            const request: AirportCreationRequest = {
                icaoId: 'INVALID',
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
        const cnf4Data: any = cnf4;
        const request: AirportCreationRequest = { ...cnf4Data, icaoId: 'CNF4' }; // Ensure 4 char code

        jest.spyOn(AdipService, 'currentEffectiveDate').mockReturnValue('20250101')
        jest.spyOn(AirportDao, 'create').mockResolvedValue(undefined)

        const result = await AirportService.createAirport(request)

        expect(result.code).toBe('CNF4')
        expect(result.name).toBe(cnf4.name)
        expect(result.elev).toBe(cnf4.elevation)
        expect(result.tpa).toBe(cnf4.trafficPatternAltitude)
        expect(result.freq).toEqual(cnf4.frequencies)
        expect(result.rwys.length).toBe(cnf4.runways.length)
        expect(result.rwys[0].name).toBe(cnf4.runways[0].name)
        expect(result.rwys[0].ends.length).toBe(2)
        expect(result.rwys[0].width).toBe(cnf4.runways[0].width)
        expect(result.source).toBe(AirportSource.User)
        expect(AirportDao.create).toHaveBeenCalledWith(expect.anything())
    })
})
