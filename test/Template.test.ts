import { describe, expect, it, jest, test} from '@jest/globals';
import { TemplateView } from '../backend/models/TemplateView';
import { Template } from '../backend/models/Template';
import { TemplateFormat } from '../backend/models/TemplateFormat';

describe('Template', () => {
    describe('fromView', () => {
        it('Constructor works', () => {
            const data = {data:'data'}
            const templateId = 1
            const userId = 2
            const version = 3
            const description = "desc"
            const pages = 4
            const name = "Some Name"
            const thumbnail = "https://some.url"
            const thumbHash = "abcdef1234567890cdfea"
            const format = TemplateFormat.FullPage

            const t = new Template(templateId, userId, data, format, name, description, version, pages, thumbnail, thumbHash)

            expect(t).toBeDefined()
            expect(t.id).toEqual(templateId)
            expect(t.userId).toEqual(userId)
            expect(t.data).toEqual(data)
            expect(t.name).toEqual(name)
            expect(t.version).toEqual(version)
            expect(t.description).toEqual(description)
            expect(t.creationDate).toBeUndefined()
            expect(t.pages).toEqual(pages)
            expect(t.thumbnail).toEqual(thumbnail)
            expect(t.thumbhash).toEqual(thumbHash)
            expect(t.format).toEqual(format)

            const t2 = new Template(templateId, userId, data, TemplateFormat.Kneeboard, name, description, version, pages)
            expect(t2.thumbnail).toBeUndefined()
            expect(t2.thumbhash).toBeUndefined()
            expect(t2.format).toEqual(TemplateFormat.Kneeboard)
        })
    })
})