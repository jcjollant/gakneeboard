
import { describe, expect, test} from '@jest/globals';
import { Template } from '../backend/models/Template.ts'
import { TemplateDao } from '../backend/TemplateDao.ts'
import { postgresUrl, jcUserId, asUserId, jcTestTemplateName, jcTestTemplateData, jcTestTemplateId } from './constants.ts';

process.env.POSTGRES_URL=postgresUrl

describe('Custom Templates', () => {
    test('read Custom', async () => {
        const t1:Template = new Template(0, jcTestTemplateName, jcTestTemplateData)
        // const TemplateData2:any = [
        // {type:'tiles', data:[{"id":0,"name":"airport","data":{"code":"krnt","rwy":"16-34"}},{"id":1,"name":"atis","data":{}},{"id":2,"name":"airport","data":{"code":"KBFI","rwy":"14L-32R","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":3,"name":"airport","data":{"code":"0W0","rwy":"18W-36W","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":4,"name":"notes","data":{}},{"id":5,"name":"atis","data":{}}]},
        // {type:'tiles', data:[{"id":0,"name":"airport","data":{"code":"ktta","rwy":"03-21","pattern":2}},{"id":1,"name":"airport","data":{"code":"kawo","rwy":"all"}},{"id":2,"name":"airport","data":{"code":"s43","rwy":"15R-33L","rwyOrientation":"magnetic"}},{"id":3,"name":"fuel"},{"id":4,"name":"notes","data":{}},{"id":5,"name":"radios","data":[{"target":"NAV1","freq":"116.8","name":"SEA VOR"},{"target":"NAV2","freq":"124.7","name":"OLM VOR"},{"target":"COM1","freq":"124.7","name":"RNT TWR"},{"target":"COM2","freq":"126.95","name":"RNT ATIS"},{"target":"COM1","freq":"123.0","name":"S43 CTAF"},{"target":"COM2","freq":"128.65","name":"PAE ATIS"},{"target":"COM1","freq":"120.2","name":"PAE TWR 34R"},{"target":"COM1","freq":"132.95","name":"PAE TWR 34L"}]}]}
        // ]
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
        const TemplateAsId:number|undefined = await TemplateDao.findByName(jcTestTemplateName, asUserId)
        expect(TemplateAsId).toBeDefined()

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
        const template = new Template( jcTestTemplateId, jcTestTemplateName, jcTestTemplateData)
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
        await TemplateDao.getListForUser(jcUserId).then( async (templates:any) => {
            expect(templates.length).toBeGreaterThan(0)
            const Template0 = templates[0]
            expect(Template0.id).toBeDefined()
            expect(Template0.name).toBeDefined()
            expect(Template0.publish).toBeDefined()
            expect(Template0.data).toHaveLength(0)

            // check page 0 is legible through readById
            await TemplateDao.readById(Template0.id, jcUserId).then((t:Template|undefined) => {
                expect(t).toBeDefined()
                expect(t?.id).toBe(Template0.id)
                expect(t?.name).toBe(Template0.name)
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

    test('Count', async () => {
        expect(await TemplateDao.count()).toBeGreaterThan(8)
    })

});

