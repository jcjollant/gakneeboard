import { describe, expect, test} from '@jest/globals';
import { Publication } from '../backend/models/Publication.ts'
import { Template } from '../backend/models/Template.ts'
import { jcTestTemplateData } from './constants.ts';

describe('Sheet class', () => {
    test('Constructor', () => {
        const id = 1
        const name = "name"
        const data = jcTestTemplateData
        const t = new Template(id, name, data)
        expect(t.id).toBe(id) 
        expect(t.name).toBe(name)
        expect(t.data).toBe(data)
        expect(t.publish).toBeFalsy()
        expect(t.code).toBeUndefined()
        expect(t.desc).toBeUndefined()
        expect(t.ver).toBe(0)

        const id2 = 2
        const name2 = ''
        const data2 = [{value:'nothing'}]
        const description2 = 'description deux'
        const publicationCode:string = "AB"
        const version = 12;
        const t2 = new Template(id2, name2, data2, description2, version, true, publicationCode)
        expect(t2.id).toBe(id2)
        expect(t2.name).toBe(name2)
        expect(t2.data).toBe(data2)
        expect(t2.desc).toBe(description2)
        expect(t2.ver).toBe(version)
        expect(t2.publish).toBeTruthy()
        expect(t2.code).toBe(publicationCode)
    })

    test('set Publication', async () => {
        const id = 1
        const name = "name"
        const data = jcTestTemplateData
        // default values
        const t = new Template(id, name, data)

        const publicationCode = "AB"
        const pub:Publication = new Publication(0, publicationCode, id, true)
        t.setPublication(pub)
        expect(t.publish).toBeTruthy()
        expect(t.code).toBe(publicationCode)

        // now mark it as unpublished
        t.setPublication(undefined)
        expect(t.publish).toBeFalsy()
        expect(t.code).toBeUndefined()

    })
})
