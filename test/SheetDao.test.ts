
import { describe, expect, test} from '@jest/globals';
import { Sheet } from '../backend/models/Sheet.ts'
import { SheetDao } from '../backend/SheetDao.ts'
import { postgresUrl, jcUserId } from './constants.ts';

process.env.POSTGRES_URL=postgresUrl

describe('Custom Sheets', () => {
    test('read Custom', async () => {
        const sheetName:string = 'TestJC'
        const sheetData:any = [{"id":0,"name":"airport","data":{"code":"krnt","rwy":"16-34"}},{"id":1,"name":"atis","data":{}},{"id":2,"name":"airport","data":{"code":"KBFI","rwy":"14L-32R","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":3,"name":"airport","data":{"code":"0W0","rwy":"18W-36W","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":4,"name":"notes","data":{}},{"id":5,"name":"atis","data":{}},{"id":6,"name":"airport","data":{"code":"ktta","rwy":"03-21","pattern":2}},{"id":7,"name":"airport","data":{"code":"kawo","rwy":"all"}},{"id":8,"name":"airport","data":{"code":"s43","rwy":"15R-33L","rwyOrientation":"magnetic"}},{"id":9,"name":"fuel"},{"id":10,"name":"notes","data":{}},{"id":11,"name":"radios","data":[{"target":"NAV1","freq":"116.8","name":"SEA VOR"},{"target":"NAV2","freq":"124.7","name":"OLM VOR"},{"target":"COM1","freq":"124.7","name":"RNT TWR"},{"target":"COM2","freq":"126.95","name":"RNT ATIS"},{"target":"COM1","freq":"123.0","name":"S43 CTAF"},{"target":"COM2","freq":"128.65","name":"PAE ATIS"},{"target":"COM1","freq":"120.2","name":"PAE TWR 34R"},{"target":"COM1","freq":"132.95","name":"PAE TWR 34L"}]}]
        const sheetData2:any = [{"id":0,"name":"airport","data":{"code":"knrt","rwy":"16-34"}},{"id":1,"name":"atis","data":{}},{"id":2,"name":"airport","data":{"code":"KBFI","rwy":"14L-32R","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":3,"name":"airport","data":{"code":"0W0","rwy":"18W-36W","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":4,"name":"notes","data":{}},{"id":5,"name":"atis","data":{}},{"id":6,"name":"airport","data":{"code":"ktta","rwy":"03-21","pattern":2}},{"id":7,"name":"airport","data":{"code":"kawo","rwy":"all"}},{"id":8,"name":"airport","data":{"code":"s43","rwy":"15R-33L","rwyOrientation":"magnetic"}},{"id":9,"name":"fuel"},{"id":10,"name":"notes","data":{}},{"id":11,"name":"radios","data":[{"target":"NAV1","freq":"116.8","name":"SEA VOR"},{"target":"NAV2","freq":"124.7","name":"OLM VOR"},{"target":"COM1","freq":"124.7","name":"RNT TWR"},{"target":"COM2","freq":"126.95","name":"RNT ATIS"},{"target":"COM1","freq":"123.0","name":"S43 CTAF"},{"target":"COM2","freq":"128.65","name":"PAE ATIS"},{"target":"COM1","freq":"120.2","name":"PAE TWR 34R"},{"target":"COM1","freq":"132.95","name":"PAE TWR 34L"}]}]
        
        // Test creation
        const returnName:string = await SheetDao.createOrUpdate( sheetName, sheetData, jcUserId)
        expect(returnName).toBe(sheetName)

        // Test find
        const sheetId:number|undefined = await SheetDao.find(sheetName, jcUserId)
        expect(sheetId).toBeDefined()

        // Test read
        const readSheet:Sheet|undefined = await SheetDao.readByName(sheetName, jcUserId)
        expect(readSheet).toBeDefined()
        expect(readSheet?.data).toEqual(sheetData)

        // Modify data and read
        const returnName1:string = await SheetDao.createOrUpdate( sheetName, sheetData2, jcUserId)
        expect(returnName1).toBe(sheetName)
        const readSheet2:any = await SheetDao.readByName(sheetName, jcUserId)
        expect(readSheet2.data).toEqual(sheetData2)
        // Id should be the same
        const sheetId2:number|undefined = await SheetDao.find(sheetName, jcUserId)
        expect(sheetId2).toEqual(sheetId)

        // Test sheet that should not exist
        const fakeSheetId:number|undefined = await SheetDao.find('fakeSheet', jcUserId)
        expect(fakeSheetId).toBeUndefined()

    })

    test("Read by Id", async () => {
        SheetDao.readById(1, jcUserId).then((data:any) => {
            expect(data).toBeDefined()
        })
        // unknown sheet should be undefined
        SheetDao.readById(0, jcUserId).then((data:any) => {
            expect(data).toBeUndefined()
        })
    })
});

