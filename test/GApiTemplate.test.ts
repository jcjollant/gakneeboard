import { describe, expect, test} from '@jest/globals';
import { GApi, GApiError } from '../backend/GApi'
import { jcHash, jcUserId, jcTestTemplateData, jcToken, jcName, jcTestTemplateName, jcTestTemplateId, jcTestTemplateDescription } from './constants'
import { currentAsOf, postgresUrl } from './constants';
import { Template } from '../backend/models/Template'
import { UserMiniView } from '../backend/models/UserMiniView';
import { template } from '@babel/core';
import { PublishedTemplate } from '../backend/models/PublishedTemplate';

process.env.POSTGRES_URL=postgresUrl


describe( 'GApi Tests', () => {

    test('Template List', async () => {
        await GApi.templateGetList(jcUserId).then( list => {
            expect(list.length).toBeGreaterThan(0)
            const testTemplate = list.find( sheet => sheet.name == jcTestTemplateName);
            expect(testTemplate).toBeDefined()
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    test('Template Get', async () => {
        // invalid pageId should throw error
        await GApi.templateGet(0,jcUserId).then( () => {
            expect(true).toBe(false) // should not get here
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
        })

        // custom template should check out
        await GApi.templateGet(jcTestTemplateId,jcUserId).then( template => {
            expect(template.name).toBe(jcTestTemplateName)
        }).catch( e => {
            expect(true).toBe(false) // should not get here
        })

    })

    test('Template update', async() => {
        // Create a public template
        const tempName = 'Temporary Name'
        const tempDesc = 'Temporary Description'
        const templateIn = new Template( jcTestTemplateId, tempName, jcTestTemplateData, tempDesc, true)
        expect(templateIn.publish).toBeTruthy()
        expect(templateIn.code).toBeUndefined()
        // Save it
        let templateOut = await GApi.templateSave(jcHash, templateIn)
        expect(templateOut.publish).toBeTruthy()
        expect(templateOut.code).toBeDefined()
        expect(templateOut.code).toHaveLength(2)
        expect(templateOut.id).toBe(jcTestTemplateId)
        expect(templateOut.name).toBe(tempName)
        expect(templateOut.desc).toBe(tempDesc)
        const publicationCode = templateOut.code        

        // get template by publication by code
        if(!publicationCode) return; // to help VSCode
        // Get the underlying publication
        let templateByCode = await GApi.publicationGet(publicationCode)
        // it should be the same as the original
        expect(templateByCode).toBeDefined()
        expect(templateByCode?.id).toBe(templateOut.id)
        // expect(templateByCode?.name).toBe(templateOut.name)
        expect(JSON.stringify(templateByCode?.data)).toBe(JSON.stringify(templateOut.data))

        // that template should show in the list of publications
        const pubs:PublishedTemplate[] = await GApi.publicationGetList()
        const found = pubs.find( pub => pub.code == publicationCode)
        expect(found).toBeDefined()

        // Update that template to be private
        // Change name and description
        templateIn.publish = false
        templateIn.name = jcTestTemplateName
        templateIn.desc = jcTestTemplateDescription
        templateOut = await GApi.templateSave(jcHash, templateIn)
        expect(templateOut.publish).toBeFalsy()
        expect(templateOut.code).toBeUndefined()
        expect(templateOut.name).toBe(jcTestTemplateName)
        expect(templateOut.desc).toBe(jcTestTemplateDescription)

        // Since template is private, its publication should not be visible
        // aka fail with 404 upon request
        await GApi.publicationGet(publicationCode).then( () => {
            expect(true).toBeFalsy() // should not get here ()
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
            expect(e.status).toBe(404)
        })

        // that template should NOT show in the list of publications
        const pubs2:PublishedTemplate[] = await GApi.publicationGetList()
        const found2 = pubs2.find( pub => pub.code == publicationCode)
        expect(found2).toBeUndefined()

        // get template by id
        let templateById = await GApi.templateGet(templateOut.id, jcUserId)
        expect(templateById).toBeDefined()
        expect(templateById?.id).toBe(templateOut.id)
        expect(templateById?.name).toBe(templateOut.name)
        expect(JSON.stringify(templateById?.data)).toBe(JSON.stringify(templateOut.data))
        expect(templateById?.publish).toBeFalsy()
        expect(templateById?.code).toBeUndefined()

        // now publish that template again to confirm code is sticky
        templateIn.publish = true
        templateOut = await GApi.templateSave(jcHash, templateIn)
        expect(templateOut.publish).toBeTruthy()
        expect(templateOut.code).toBe(publicationCode)

    })

})