import { describe, expect, it, test} from '@jest/globals';
import { Publication } from '../backend/models/Publication'
import { jcTestTemplateData, jcUserId } from './constants';
import { TemplateView } from '../backend/models/TemplateView';
import { Template } from '../backend/models/Template';

describe('Sheet class', () => {
    test('Constructor', () => {
        const id = 1
        const name = "name"
        const data = jcTestTemplateData
        const t = new TemplateView(id, name, data)
        expect(t.id).toBe(id) 
        expect(t.name).toBe(name)
        expect(t.data).toBe(data)
        expect(t.publish).toBeFalsy()
        expect(t.code).toBeUndefined()
        expect(t.desc).toBeUndefined()
        expect(t.ver).toBe(0)
        expect(t.pages).toBe(jcTestTemplateData.length)

        const id2 = 2
        const name2 = ''
        const data2 = [{value:'nothing'}]
        const description2 = 'description deux'
        const publicationCode:string = "AB"
        const version = 12;
        const pages = 13
        const t2 = new TemplateView(id2, name2, data2, description2, version, true, publicationCode, pages)
        expect(t2.id).toBe(id2)
        expect(t2.name).toBe(name2)
        expect(t2.data).toBe(data2)
        expect(t2.desc).toBe(description2)
        expect(t2.ver).toBe(version)
        expect(t2.publish).toBeTruthy()
        expect(t2.code).toBe(publicationCode)
        expect(t2.pages).toBe(pages)
    })

    it('Can Parse Template', async () => {
        const id = 1
        const name = "name"
        const data = jcTestTemplateData
        const version = 6
        const description = "Some Description"
        const pages = jcTestTemplateData.length
        const thumbnail = "http://thumbnail.url"  
        const thumbhash = "1236549871563546asdqweasd"
        // default values

        const publicationCode = "AB"
        const t = new Template(id, jcUserId, jcTestTemplateData, name, description, version, pages, thumbnail, thumbhash)
        const pub = new Publication(0, publicationCode, id, true)
        const tv = TemplateView.parseTemplate(t, pub)
        expect(tv).toBeDefined()
        expect(tv.id).toBe(id)
        expect(tv.name).toBe(name)
        expect(tv.desc).toBe(description)
        expect(tv.data).toBe(data)
        expect(tv.ver).toBe(version)
        expect(tv.publish).toBeTruthy()
        expect(tv.code).toBe(publicationCode)
        expect(tv.pages).toBe(pages)
        expect(tv.thumbUrl).toBe(thumbnail)
        expect(tv.thumbHash).toBe(thumbhash)
    })
    it('can parse', () => {
        const sheetId = 12
        const name = "name"
        const data = jcTestTemplateData
        const description = "Some Description"
        const version = 28
        const code = "AB"
        const sheet  = {id:sheetId, name:name, data:data, description:description, ver:version, publish:false, code:code}

        const parsed = TemplateView.parse(sheet)
        expect(parsed).toBeDefined()
        expect(parsed.id).toBe(sheetId)
        expect(parsed.name).toBe(name)
        expect(parsed.data).toBe(data)
        expect(parsed.desc).toBe(description)
        expect(parsed.ver).toBe(version)
        expect(parsed.publish).toBeFalsy()
        expect(parsed.code).toBe(code)  
    })
})
