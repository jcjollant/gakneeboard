import { describe, expect, it, test } from '@jest/globals';
import { Publication } from '../backend/models/Publication'
import { jcTestTemplateData, jcUserId } from './constants';
import { TemplateKneeboardView } from '../backend/models/TemplateKneeboardView';
import { Template } from '../backend/models/Template';
import e from 'express';
import { TemplateFormat } from '@gak/shared';

describe('Sheet class', () => {
    describe('constructor', () => {
        it('Consumes parameters', () => {
            const id2 = 2
            const name2 = ''
            const data2 = [{ value: 'nothing' }]
            const description2 = 'description deux'
            const publicationCode: string = "AB"
            const version = 12;
            const pages = 13
            const thumbnail = 'https://some.url'
            const thumbhash = '1236549871563546asdqweasd'
            const format = TemplateFormat.FullPage
            const t = new TemplateKneeboardView(id2, name2, data2, format, description2, version, true, publicationCode, pages, thumbnail, thumbhash)
            expect(t.id).toBe(id2)
            expect(t.name).toBe(name2)
            expect(t.data).toBe(data2)
            expect(t.desc).toBe(description2)
            expect(t.ver).toBe(version)
            expect(t.publish).toBeTruthy()
            expect(t.code).toBe(publicationCode)
            expect(t.pages).toBe(pages)
            expect(t.thumbUrl).toBe(thumbnail)
            expect(t.thumbHash).toBe(thumbhash)
            expect(t.format).toBe(format)
        })

        it('Creates default values', () => {
            const id = 1
            const name = "name"
            const data = ['a', 'b', 'c']
            const t = new TemplateKneeboardView(id, name, data)
            expect(t).toBeDefined()
            expect(t.id).toBe(id)
            expect(t.name).toBe(name)
            expect(t.data).toBe(data)
            expect(t.desc).toBeUndefined()
            expect(t.ver).toBe(0)
            expect(t.publish).toBeFalsy()
            expect(t.code).toBeUndefined()
            expect(t.pages).toBe(data.length)
            expect(t.thumbUrl).toBeUndefined()
            expect(t.thumbHash).toBeUndefined()
            expect(t.format).toBe(TemplateFormat.Kneeboard)
        })

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
        const format = TemplateFormat.FullPage
        // default values

        const publicationCode = "AB"
        const t = new Template(id, jcUserId, jcTestTemplateData, format, name, description, version, pages, thumbnail, thumbhash)
        const pub = new Publication(0, publicationCode, id, true)
        const tv = TemplateKneeboardView.parseTemplate(t, pub)
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
        expect(tv.format).toBe(format)
    })
    it('can parse', () => {
        const sheetId = 12
        const name = "name"
        const data = jcTestTemplateData
        const description = "Some Description"
        const version = 28
        const code = "AB"
        const sheet = { id: sheetId, name: name, data: data, format: 'fullpage', description: description, ver: version, publish: false, code: code }

        const parsed = TemplateKneeboardView.parse(sheet)
        expect(parsed).toBeDefined()
        expect(parsed.id).toBe(sheetId)
        expect(parsed.name).toBe(name)
        expect(parsed.data).toBe(data)
        expect(parsed.desc).toBe(description)
        expect(parsed.ver).toBe(version)
        expect(parsed.publish).toBeFalsy()
        expect(parsed.code).toBe(code)
        expect(parsed.format).toBe(TemplateFormat.FullPage)
    })
})
