import { describe, expect, it, jest, test} from '@jest/globals';
import { GApi, GApiError } from '../backend/GApi'
import { jcHash, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription } from './constants'
import { Template } from '../backend/models/Template'
import { PublishedTemplate } from '../backend/models/PublishedTemplate';
import { TemplateDao } from '../backend/TemplateDao';
import { PublicationDao } from '../backend/PublicationDao';
import { Publication } from '../backend/models/Publication';
import { UserDao } from '../backend/dao/UserDao';
import exp from 'constants';

require('dotenv').config();

describe( 'GApi Tests', () => {

    describe('templateDelete', () => {
        it('returns 404 on not found', async () => {
            jest.spyOn(TemplateDao, 'readById').mockResolvedValue(undefined);
            // expect this to throw new GApiError(404, 'Template not found');
            await expect(GApi.templateDelete(0, jcUserId)).rejects.toMatchObject({status:404});
        })

        it('succeed with proper template', async () => {
            const templateId = 22
            const template = new Template( templateId, jcTestTemplateName, jcTestTemplateData)
            jest.spyOn(TemplateDao, 'readById').mockResolvedValue(template);
            jest.spyOn(TemplateDao, 'delete').mockResolvedValue(1);

            const name = await GApi.templateDelete( templateId, jcUserId)

            expect(name).toBe(jcTestTemplateName)
            expect(TemplateDao.delete).toBeCalledWith(templateId, jcUserId)
        })
    })


    describe('tempalteGet', () => {
        it('Returns undefined for Invalid template', async () => {
            jest.spyOn(TemplateDao, 'readById').mockResolvedValue(undefined);

            const t = await GApi.templateGet(0,jcUserId)
            expect(t).toBeUndefined()
        })

        it('Returns template with publication status', async () => {
            const template = new Template(0, jcTestTemplateName, jcTestTemplateData)
            jest.spyOn(TemplateDao, 'readById').mockResolvedValue(template);
            jest.spyOn(PublicationDao, 'findByTemplate').mockResolvedValue(undefined);

            const t = await GApi.templateGet(0,jcUserId)
            expect(t).toBe(template)
            expect(t?.publish).toBeFalsy()

            // now try with publication
            const publication = new Publication(0, 'code', template.id, true)
            jest.spyOn(PublicationDao, 'findByTemplate').mockResolvedValue(publication);

            const t2 = await GApi.templateGet(0,jcUserId)
            expect(t2?.publish).toBeTruthy()
        })
    })

    describe('templateGetList', () => {
        it('calls Dao', async () => {
            jest.spyOn(TemplateDao, 'getOverviewListForUser').mockResolvedValue([]);

            await GApi.templateGetList(jcUserId)

            expect(TemplateDao.getOverviewListForUser).toBeCalledWith(jcUserId)
        })
    })

    describe('templateSave', () => {
        it('dodges invalid user', async () => {
            jest.spyOn(TemplateDao, 'getOverviewListForUser').mockResolvedValue([]);
            jest.spyOn(UserDao, 'getIdFromHash').mockResolvedValue(undefined)
            const template = new Template(0, jcTestTemplateName, jcTestTemplateData)

            await expect(GApi.templateSave(jcHash, template)).rejects.toBeInstanceOf(GApiError)

            expect(UserDao.getIdFromHash).toBeCalledWith(jcHash)
        })

        it('finds publication code', async () => {
            const templateId = 33;
            const publicTemplate = new Template(templateId, jcTestTemplateName, jcTestTemplateData)
            publicTemplate.publish = true
            const publicationCode = 'ZZ'
            const publication = new Publication(0, publicationCode, publicTemplate.id, true)

            jest.spyOn(UserDao, 'getIdFromHash').mockResolvedValue(jcUserId)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(publicTemplate)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(publication)

            const t = await GApi.templateSave(jcHash, publicTemplate)

            expect(t.code).toBe(publicationCode)
            expect(t.publish).toBeTruthy()
            expect(t.id).toBe(publicTemplate.id)
            expect(TemplateDao.createOrUpdate).lastCalledWith(publicTemplate, jcUserId)
            expect(PublicationDao.publish).lastCalledWith(publicTemplate.id)
        })

        it('sends error if publication failed', async () => {

            const templateId = 33;
            const publicTemplate = new Template(templateId, jcTestTemplateName, jcTestTemplateData)
            publicTemplate.publish = true

            jest.spyOn(UserDao, 'getIdFromHash').mockResolvedValue(jcUserId)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(publicTemplate)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)

            // if publication fails, it should throw an error
            await expect(GApi.templateSave(jcHash, publicTemplate)).rejects.toBeInstanceOf(GApiError)
        })

        it('works with unpublished templates', async() =>{
            const templateId = 44;
            const privateTemplate = new Template(templateId, jcTestTemplateName, jcTestTemplateData, '', 1, false)

            jest.spyOn(UserDao, 'getIdFromHash').mockResolvedValue(jcUserId)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(privateTemplate)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)

            const t = await GApi.templateSave(jcHash, privateTemplate)

            expect(t.code).toBeUndefined()
            expect(t.publish).toBeFalsy()
            expect(t.id).toBe(templateId)
        })
    })

})