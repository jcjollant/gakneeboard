import { describe, expect, it, jest, test} from '@jest/globals';
import { TemplateView } from '../backend/models/TemplateView';
import { Template } from '../backend/models/Template';

describe('Template', () => {
    describe('fromView', () => {
        it('Can copy TemplateView', () => {
            const data = {data:'data'}
            const templateId = 1
            const userId = 2
            const version = 3
            const description = "desc"
            const pages = 4

            const tv = new TemplateView( templateId, "name", data, description, version, false, "code", pages)
            const t = Template.fromView(tv, userId)

            expect(t).toBeDefined()
            expect(t.id).toEqual(templateId)
            expect(t.userId).toEqual(userId)
            expect(t.data).toEqual(data)
            expect(t.name).toEqual("name")
            expect(t.version).toEqual(version)
            expect(t.description).toEqual(description)
            expect(t.creationDate).toBeUndefined()
            expect(t.pages).toEqual(pages)
        })

        it.only('Works with minimum parameters', () => {
            const templateId = 1
            const userId = 2

            const tv = new TemplateView( templateId, '', {})
            const t = Template.fromView(tv, userId)

            expect(t).toBeDefined()
            expect(t.id).toEqual(templateId)
            expect(t.userId).toEqual(userId)
            expect(t.data).toEqual({})
            expect(t.name).toEqual("")
            expect(t.version).toEqual(0)
            expect(t.description).toBeUndefined()
            expect(t.creationDate).toBeUndefined()
            expect(t.pages).toEqual(0)
        })
    })
})