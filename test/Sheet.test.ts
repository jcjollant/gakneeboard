import { describe, expect, test} from '@jest/globals';
import { Publication } from '../backend/models/Publication.ts'
import { Sheet } from '../backend/models/Sheet.ts'
import { jcTestSheetData } from './constants.ts';

describe('Sheet class', () => {
    test('set Publication', async () => {
        const sheetId = 1
        const sheetName = "name"
        const sheetData = jcTestSheetData
        const sheet = new Sheet(sheetId, sheetName, sheetData)
        expect(sheet.id).toBe(sheetId) 
        expect(sheet.name).toBe(sheetName)
        expect(sheet.data).toBe(sheetData)
        expect(sheet.publish).toBeFalsy()
        expect(sheet.code).toBeUndefined()
        const publicationCode = "AB"
        const pub:Publication = new Publication(0, publicationCode, sheetId)
        sheet.setPublication(pub)
        expect(sheet.publish).toBeTruthy()
        expect(sheet.code).toBe(publicationCode)

        // now mark it as unpublished
        sheet.setPublication(undefined)
        expect(sheet.publish).toBeFalsy()
        expect(sheet.code).toBeUndefined()

    })
})
