
import { describe, expect, test} from '@jest/globals';
import { Sheet } from '../backend/models/Sheet.ts'
import { SheetDao } from '../backend/SheetDao.ts'
import { postgresUrl, jcUserId, asUserId, jcTestSheetName, jcTestSheetData, jcTestSheetId } from './constants.ts';

process.env.POSTGRES_URL=postgresUrl

describe('Custom Sheets', () => {
    test('read Custom', async () => {
        const sheet1:Sheet = new Sheet(0, jcTestSheetName, jcTestSheetData)
        // const sheetData2:any = [
        // {type:'tiles', data:[{"id":0,"name":"airport","data":{"code":"krnt","rwy":"16-34"}},{"id":1,"name":"atis","data":{}},{"id":2,"name":"airport","data":{"code":"KBFI","rwy":"14L-32R","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":3,"name":"airport","data":{"code":"0W0","rwy":"18W-36W","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":4,"name":"notes","data":{}},{"id":5,"name":"atis","data":{}}]},
        // {type:'tiles', data:[{"id":0,"name":"airport","data":{"code":"ktta","rwy":"03-21","pattern":2}},{"id":1,"name":"airport","data":{"code":"kawo","rwy":"all"}},{"id":2,"name":"airport","data":{"code":"s43","rwy":"15R-33L","rwyOrientation":"magnetic"}},{"id":3,"name":"fuel"},{"id":4,"name":"notes","data":{}},{"id":5,"name":"radios","data":[{"target":"NAV1","freq":"116.8","name":"SEA VOR"},{"target":"NAV2","freq":"124.7","name":"OLM VOR"},{"target":"COM1","freq":"124.7","name":"RNT TWR"},{"target":"COM2","freq":"126.95","name":"RNT ATIS"},{"target":"COM1","freq":"123.0","name":"S43 CTAF"},{"target":"COM2","freq":"128.65","name":"PAE ATIS"},{"target":"COM1","freq":"120.2","name":"PAE TWR 34R"},{"target":"COM1","freq":"132.95","name":"PAE TWR 34L"}]}]}
        // ]
        const sheetData2:any = [
            {type:'selection', data:{}},
            {type:'selection', data:{}}
            ]
            const sheet2:Sheet = new Sheet(0, jcTestSheetName, sheetData2)
     
        // Test creation with same name should keep same Id
        const returnSheet:Sheet = await SheetDao.createOrUpdate( sheet1, jcUserId)
        expect(returnSheet.name).toBe(jcTestSheetName)

        // Test find by name
        const sheetId:number|undefined = await SheetDao.findByName(jcTestSheetName, jcUserId)
        expect(sheetId).toBeDefined()
        expect(sheetId).toBe(returnSheet.id)
        const jcTestSheetId:number = sheetId as number

        // Test read by Id

        // Test find by name for same name and other user
        const sheetAsId:number|undefined = await SheetDao.findByName(jcTestSheetName, asUserId)
        expect(sheetAsId).toBeDefined()

        // Modify data with only name and check only data has changed
        const returnSheet2:Sheet = await SheetDao.createOrUpdate( sheet2, jcUserId)
        expect(returnSheet2.id).toBe(jcTestSheetId)
        expect(returnSheet2.name).toBe(jcTestSheetName)
        expect(returnSheet2.data).toEqual(sheetData2)

        // Update Sheet name with the same Sheet id
        const sheetName3:string = 'TestJC3'
        const sheet3:Sheet = new Sheet(jcTestSheetId, sheetName3, jcTestSheetData)
        const returnSheet3:Sheet = await SheetDao.createOrUpdate(sheet3, jcUserId)
        expect(returnSheet3.id).toBe(jcTestSheetId)
        expect(returnSheet3.name).toBe(sheetName3)
        expect(returnSheet3.data).toEqual(jcTestSheetData)

        // restore original name
        await SheetDao.createOrUpdate(sheet1, jcUserId)

        // Test find by name for same name and other user
    })

    test('Invalid sheet name', () => {
        // Test sheet that should not exist
        SheetDao.findByName('fakeSheet', jcUserId)
            .then( id => {
                expect(id).toBeUndefined()
            }).catch( err => {
                expect(false).toBe(true)
            })
    })


    test('Invalid sheet or user Id', async () => {
        // invalid Id, valid user
        await SheetDao.readById(0, jcUserId).then((data:any) => {
            expect(data).toBeUndefined()
        }).catch( err => {
            console.log(err)
            expect(false).toBe(true)
        })
        // Valid Id invalid user
        await SheetDao.readById(1, -1).then((data:any) => {
            expect(data).toBeUndefined()
        }).catch( err => {
            console.log(err)
            expect(false).toBe(true)
        })
    })

    test("Read by Id invalid", async () => {
        // unknown sheet should be undefined
        await SheetDao.readById(0, jcUserId).then((data:any) => {
            expect(data).toBeUndefined()
        }).catch( err => {
            console.log(err)
            expect(false).toBeTruthy()
        })
    })

    test('getListForUser and readById', async () => {
        // refresh jcTestPage
        const sheet = new Sheet( jcTestSheetId, jcTestSheetName, jcTestSheetData)
        // console.log(JSON.stringify(sheet))
        await SheetDao.createOrUpdate( sheet, jcUserId).then(sheet => {
            expect(sheet.id).toBeDefined()
            expect(sheet.publish).toBeFalsy()
            expect(sheet.code).toBeUndefined()
            expect(sheet.data.length).toBe(2)

        }).catch( e => {
            console.log('Failed to update test sheet ' + e)
            expect(false).toBeTruthy()
        })
        await SheetDao.getListForUser(jcUserId).then( async (sheets:any) => {
            expect(sheets.length).toBeGreaterThan(0)
            const sheet0 = sheets[0]
            expect(sheet0.id).toBeDefined()
            expect(sheet0.name).toBeDefined()
            expect(sheet0.publish).toBeDefined()
            expect(sheet0.data).toHaveLength(0)

            // check page 0 is legible through readById
            await SheetDao.readById(sheet0.id, jcUserId).then((sheet:Sheet|undefined) => {
                expect(sheet).toBeDefined()
                expect(sheet?.id).toBe(sheet0.id)
                expect(sheet?.name).toBe(sheet0.name)
                expect(sheet?.publish).toBeDefined();
                expect(sheet?.data).toHaveLength(2)
            }).catch( err => {
                console.log(err)
                expect(false).toBeTruthy()
            })
        }).catch( err => {
            console.log('Failed to get list by user', err)
            expect(false).toBe(true)
        })

    })

    test('Create and Delete', async() => {
        const sheetName:string = 'TempSheetThatProbablyDoesntExist'
        await SheetDao.createOrUpdate(new Sheet(0, sheetName, jcTestSheetData), jcUserId)
            .then( sheet => {
                expect(sheet).toBeDefined()
                expect(sheet.id).toBeDefined()
                expect(sheet.name).toBe(sheetName)
                SheetDao.delete(sheet.id, jcUserId).then( id => {
                    expect(id).toBe(sheet.id)
                })
            }).catch( err => {
                console.log(err)
                expect(false).toBe(true)
            })
    })

    test('Count', async () => {
        expect(await SheetDao.count()).toBeGreaterThan(8)
    })

});

