import { describe, expect, test} from '@jest/globals';
import { Publication } from '../backend/models/Publication.ts'
import { Template } from '../backend/models/Template.ts'
import { jcTestTemplateData } from './constants.ts';

describe('Sheet class', () => {
    test('set Publication', async () => {
        const id = 1
        const name = "name"
        const data = jcTestTemplateData
        const t = new Template(id, name, data)
        expect(t.id).toBe(id) 
        expect(t.name).toBe(name)
        expect(t.data).toBe(data)
        expect(t.publish).toBeFalsy()
        expect(t.code).toBeUndefined()
        const publicationCode = "AB"
        const pub:Publication = new Publication(0, publicationCode, id)
        t.setPublication(pub)
        expect(t.publish).toBeTruthy()
        expect(t.code).toBe(publicationCode)

        // now mark it as unpublished
        t.setPublication(undefined)
        expect(t.publish).toBeFalsy()
        expect(t.code).toBeUndefined()

    })
})
