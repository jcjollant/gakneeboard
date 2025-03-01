
import { describe, expect, test} from '@jest/globals';
import { Template } from '../backend/models/Template.ts'
import { TemplateDao } from '../backend/TemplateDao.ts'
import { jcUserId, jcTestTemplateName, jcTestTemplateData, jcMaxTemplates, jcHash2 } from './constants.ts';
import { UserDao } from '../backend/dao/UserDao.ts';
import { sql } from '@vercel/postgres';

require('dotenv').config();

async function wipeTemplates() {
    expect(process.env.SAFE_TO_DELETE_TEMPLATES).toBe('yes')
    await sql`TRUNCATE sheets`
}

describe('Custom Templates', () => {
    test('read Custom', async () => {
        wipeTemplates();

        const jcUserId2 = await UserDao.getIdFromHash(jcHash2)
        expect(jcUserId2).toBeDefined()
        if(!jcUserId2) return;

        // create two templates with the same name and different data
        const t1:Template = new Template(0, jcTestTemplateName, jcTestTemplateData)
        const TemplateData2:any = [
            {type:'selection', data:{}},
            {type:'selection', data:{}}
            ]
        const t2:Template = new Template(0, jcTestTemplateName, TemplateData2)
     
        // Test creation with same name should keep same Id
        const returnTemplate:Template = await TemplateDao.createOrUpdate( t1, jcUserId)
        expect(returnTemplate.name).toBe(jcTestTemplateName)

        // Test find by name
        const templateId:number|undefined = await TemplateDao.findByName(jcTestTemplateName, jcUserId)
        expect(templateId).toBeDefined()
        expect(templateId).toBe(returnTemplate.id)
        const jcTestTemplateId:number = templateId as number

        // Test read by Id

        // Test find by name for same name and other user
        const TemplateAsId:number|undefined = await TemplateDao.findByName(jcTestTemplateName, jcUserId2)
        expect(TemplateAsId).toBeUndefined()

        // Create second template with userId2
        const templateId2:number|undefined = await TemplateDao.findByName(jcTestTemplateName, jcUserId2)
        expect(templateId2).not.toBe(templateId)

        // Modify data with only name and check only data has changed
        const returnTemplate2:Template = await TemplateDao.createOrUpdate( t2, jcUserId)
        expect(returnTemplate2.id).toBe(jcTestTemplateId)
        expect(returnTemplate2.name).toBe(jcTestTemplateName)
        expect(returnTemplate2.data).toEqual(TemplateData2)

        // Update Template name with the same Template id
        const TemplateName3:string = 'TestJC3'
        const Template3:Template = new Template(jcTestTemplateId, TemplateName3, jcTestTemplateData)
        const returnTemplate3:Template = await TemplateDao.createOrUpdate(Template3, jcUserId)
        expect(returnTemplate3.id).toBe(jcTestTemplateId)
        expect(returnTemplate3.name).toBe(TemplateName3)
        expect(returnTemplate3.data).toEqual(jcTestTemplateData)

        // restore original name
        await TemplateDao.createOrUpdate(t1, jcUserId)

        // Test find by name for same name and other user
    })

    test('Invalid Template name', () => {
        // Test Template that should not exist
        TemplateDao.findByName('fakeTemplate', jcUserId)
            .then( id => {
                expect(id).toBeUndefined()
            }).catch( err => {
                expect(false).toBe(true)
            })
    })


    test('Invalid Template or user Id', async () => {
        // invalid Id, valid user
        await TemplateDao.readById(0, jcUserId).then((data:any) => {
            expect(data).toBeUndefined()
        }).catch( err => {
            console.log(err)
            expect(false).toBe(true)
        })
        // Valid Id invalid user
        await TemplateDao.readById(1, -1).then((data:any) => {
            expect(data).toBeUndefined()
        }).catch( err => {
            console.log(err)
            expect(false).toBe(true)
        })
    })

    test("Read by Id invalid", async () => {
        // unknown Template should be undefined
        await TemplateDao.readById(0, jcUserId).then((data:any) => {
            expect(data).toBeUndefined()
        }).catch( err => {
            console.log(err)
            expect(false).toBeTruthy()
        })
    })

    test('getListForUser and readById', async () => {
        // refresh jcTestPage
        const template = new Template( 0, jcTestTemplateName, jcTestTemplateData)
        // console.log(JSON.stringify(Template))
        await TemplateDao.createOrUpdate( template, jcUserId).then(t => {
            expect(t.id).toBeDefined()
            expect(t.publish).toBeFalsy()
            expect(t.code).toBeUndefined()
            expect(t.data.length).toBe(2)

        }).catch( e => {
            console.log('Failed to update test Template ' + e)
            expect(false).toBeTruthy()
        })

        await TemplateDao.getOverviewListForUser(jcUserId).then( async (templates:any) => {
            expect(templates.length).toBeGreaterThan(0)
            const template0 = templates[0]
            expect(template0.id).toBeDefined()
            expect(template0.name).toBeDefined()
            expect(template0.publish).toBeDefined()
            expect(template0.data).toHaveLength(0)

            // check page 0 is legible through readById
            await TemplateDao.readById(template0.id, jcUserId).then((t:Template|undefined) => {
                expect(t).toBeDefined()
                expect(t?.id).toBe(template0.id)
                expect(t?.name).toBe(template0.name)
                expect(t?.publish).toBeDefined();
                expect(t?.data).toHaveLength(2)
            }).catch( err => {
                console.log(err)
                expect(false).toBeTruthy()
            })
        }).catch( err => {
            console.log('Failed to get list by user', err)
            expect(false).toBe(true)
        })

    })

    test('Create and Delete', async() => {
        const templateName:string = 'TempTemplateThatProbablyDoesntExist'
        await TemplateDao.createOrUpdate(new Template(0, templateName, jcTestTemplateData), jcUserId)
            .then( t => {
                expect(t).toBeDefined()
                expect(t.id).toBeDefined()
                expect(t.name).toBe(templateName)
                TemplateDao.delete(t.id, jcUserId).then( id => {
                    expect(id).toBe(t.id)
                })
            }).catch( err => {
                console.log(err)
                expect(false).toBe(true)
            })
    })

    test('Count by User', async() => {

        wipeTemplates()

        const jcUserId2=await UserDao.getIdFromHash(jcHash2)
        expect(jcUserId2).toBeDefined()
        if(!jcUserId2) return;
        let expectedCount:number = 0
        let expectedCountJc:number = 0
        await TemplateDao.createOrUpdate(new Template(0, 'Test1', jcTestTemplateData), jcUserId)
        expectedCount++;
        expectedCountJc++;
        await TemplateDao.createOrUpdate(new Template(0, 'Test2', jcTestTemplateData), jcUserId)
        expectedCount++;
        expectedCountJc++;
        await TemplateDao.createOrUpdate(new Template(0, 'Test3', jcTestTemplateData), jcUserId2)
        expectedCount++;

        expect(await TemplateDao.count()).toBe(expectedCount)

        const counts:[number,number][] = await TemplateDao.countByUser()
        // we should see values
        expect(counts).toStrictEqual([[jcUserId,expectedCountJc],[jcUserId2,expectedCount-expectedCountJc]])
    })

});

