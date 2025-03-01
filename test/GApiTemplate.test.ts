import { describe, expect, test} from '@jest/globals';
import { GApi, GApiError } from '../backend/GApi'
import { jcHash, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription } from './constants'
import { Template } from '../backend/models/Template'
import { template } from '@babel/core';
import { PublishedTemplate } from '../backend/models/PublishedTemplate';
import { TemplateDao } from '../backend/TemplateDao';
import { sql } from '@vercel/postgres';
import exp from 'constants';

require('dotenv').config();

async function safeTruncate() {
    expect(process.env.SAFE_TO_DELETE_TEMPLATES).toBe('yes')
    await Promise.all([
        sql`TRUNCATE sheets`,
        sql`UPDATE publications SET sheetid=NULL`
    ])

}

describe( 'GApi Tests', () => {

    test('Template List', async () => {
        const templateIn = new Template( 0, jcTestTemplateName, jcTestTemplateData)
        // Save it
        await GApi.templateSave(jcHash, templateIn)
        await GApi.templateGetList(jcUserId).then( list => {
            expect(list.length).toBeGreaterThan(0)
            const testTemplate = list.find( sheet => sheet.name == jcTestTemplateName);
            expect(testTemplate).toBeDefined()
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    test('Invalid Template', async () => {
        // invalid pageId should throw error
        await GApi.templateGet(0,jcUserId).then( () => {
            expect(true).toBe(false) // should not get here
        }).catch( e => {
            expect(e).toBeInstanceOf(GApiError)
        })

    })

    test('Template Save, Get, Update', async() => {
        // Create a public template
        const tempName = 'Temporary Name ' + Date()
        const tempDesc = 'Temporary Description'
        const tempVer = 12;

        safeTruncate()

        const templateIn = new Template( 0, tempName, jcTestTemplateData, tempDesc, tempVer, true)
        // Save it
        const template1 = await GApi.templateSave(jcHash, templateIn)
        expect(template1.publish).toBeTruthy()
        expect(template1.code).toBeDefined()
        expect(template1.code).toHaveLength(2)
        expect(template1.name).toBe(tempName)
        expect(template1.desc).toBe(tempDesc)
        // Initial save should keep version number
        expect(template1.ver).toBe(tempVer)

        const publicationCode = template1.code        

        const template2 = await GApi.templateGet(template1.id, jcUserId)
        expect(template2.publish).toBeTruthy()
        expect(template2.code).toBeDefined()
        expect(template2.code).toHaveLength(2)
        expect(template2.name).toBe(tempName)
        expect(template2.desc).toBe(tempDesc)
        expect(template2.id).toBe(template1.id)

        // get template by publication by code
        expect(publicationCode).toBeTruthy()
        if(!publicationCode) return; // to help VSCode

        // Get the underlying publication
        let templateByCode = await GApi.publicationGet(publicationCode)
        // it should be the same as the original
        expect(templateByCode).toBeDefined()
        expect(templateByCode?.id).toBe(template2.id)
        // expect(templateByCode?.name).toBe(templateOut.name)
        expect(JSON.stringify(templateByCode?.data)).toBe(JSON.stringify(template2.data))

        // that template should show in the list of publications
        const pubs:PublishedTemplate[] = await GApi.publicationGetList()
        const found = pubs.find( pub => pub.code == publicationCode)
        expect(found).toBeDefined()

        // Update that template to be private
        // Change name and description
        templateIn.publish = false
        templateIn.name = jcTestTemplateName
        templateIn.desc = jcTestTemplateDescription
        const template3 = await GApi.templateSave(jcHash, templateIn)
        expect(template3.publish).toBeFalsy()
        expect(template3.code).toBeUndefined()
        expect(template3.name).toBe(jcTestTemplateName)
        expect(template3.desc).toBe(jcTestTemplateDescription)

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
        let templateById = await GApi.templateGet(template1.id, jcUserId)
        expect(templateById).toBeDefined()
        expect(templateById?.id).toBe(template1.id)
        expect(templateById?.name).toBe(jcTestTemplateName)
        expect(JSON.stringify(templateById?.data)).toBe(JSON.stringify(template2.data))
        expect(templateById?.publish).toBeFalsy()
        expect(templateById?.code).toBeUndefined()

        // now publish that template again to confirm code is sticky
        templateIn.publish = true
        const template4 = await GApi.templateSave(jcHash, templateIn)
        expect(template4.publish).toBeTruthy()
        expect(template4.code).toBe(publicationCode)

        await TemplateDao.delete(template1.id, jcUserId)

    })

})