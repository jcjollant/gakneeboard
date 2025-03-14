import { describe, expect, it, jest, test} from '@jest/globals';
import { GApi, GApiError, TemplateStatus } from '../backend/GApi'
import { jcHash, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription } from './constants'
import { TemplateDao } from '../backend/TemplateDao';
import { PublicationDao } from '../backend/PublicationDao';
import { Publication } from '../backend/models/Publication';
import { UserDao } from '../backend/dao/UserDao';
import { TemplateView } from '../backend/models/TemplateView';
import { Template } from '../backend/models/Template';
import { User } from '../backend/models/User';
import { newTestUser } from './common';
import { sourceMapsEnabled } from 'process';
import { Business } from '../backend/business/Business';
import { AccountType } from '../backend/models/AccountType';
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
            const template = new TemplateView( templateId, jcTestTemplateName, jcTestTemplateData)
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
            const template = new TemplateView(0, jcTestTemplateName, jcTestTemplateData)
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
        it('dodges invalid and unknown user', async () => {
            jest.clearAllMocks()
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(undefined)
            const template = new TemplateView(0, jcTestTemplateName, jcTestTemplateData)

            await expect(GApi.templateSave(jcHash, template)).rejects.toEqual(new GApiError(400, "Invalid user"))
            expect(UserDao.getUserFromHash).toBeCalledWith(jcHash)

            await expect(GApi.templateSave(null as unknown as string, template)).rejects.toEqual(new GApiError(400, "Invalid user"))
        })

        it('dodges invalid tempalte', async () => {
            jest.clearAllMocks()
            const simUser = newTestUser()
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)

            await expect(GApi.templateSave(simUser.sha256, null as unknown as TemplateView)).rejects.toEqual(new GApiError(400, "Invalid template"))
        })

        it('blocks maxed out users', async () => {
            jest.clearAllMocks()
            const simUserId = 55
            const simUser = newTestUser(simUserId)
            simUser.accountType = AccountType.simmer
            simUser.maxTemplates = 30

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)

            // User already has max templates
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER)

            const tv = new TemplateView(0, jcTestTemplateName, jcTestTemplateData)

            await expect(GApi.templateSave(simUser.sha256, tv)).rejects.toEqual(new GApiError(402, "Cannot create a new Template while over maximum for account type"))

            expect(TemplateDao.countForUser).toBeCalledWith(simUserId)
            expect(UserDao.getUserFromHash).toBeCalledWith(simUser.sha256)

        })

        it('Gives grace to maxed out updates', async () => {
            jest.clearAllMocks()
            const simUserId = 55
            const simUser = newTestUser(simUserId)
            simUser.accountType = AccountType.simmer
            const templateId = 66
            const publicTemplate = new Template(templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription, 0, 0)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(publicTemplate)
            // User already has max templates
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()

            const tv = new TemplateView(1, jcTestTemplateName, jcTestTemplateData)

            await GApi.templateSave(simUser.sha256, tv).then( ts => {
                expect(ts.code).toBe(202)
            })

        })

        it('finds publication code', async () => {
            jest.clearAllMocks()
            const templateId = 33;
            const publicTemplateView = new TemplateView(templateId, jcTestTemplateName, jcTestTemplateData)
            const publicTemplate = new Template(templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription, 0, 0)
            publicTemplateView.publish = true
            const publicationCode = 'ZZ'
            const publication = new Publication(0, publicationCode, publicTemplateView.id, true)

            const userJc = new User(jcUserId, jcHash)
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(publicTemplate)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(publication)

            const ts = await GApi.templateSave(jcHash, publicTemplateView)
            const t = ts.template

            expect(t.code).toBe(publicationCode)
            expect(t.publish).toBeTruthy()
            expect(t.id).toBe(publicTemplateView.id)
            expect(TemplateDao.createOrUpdate).lastCalledWith(publicTemplateView, jcUserId)
            expect(PublicationDao.publish).lastCalledWith(publicTemplateView.id)
        })

        it('sends error if publication failed', async () => {
            jest.clearAllMocks()

            const templateId = 33;
            const publicTemplateView = new TemplateView(templateId, jcTestTemplateName, jcTestTemplateData)
            const publicTemplate = new Template(templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription, 0, 0)
            publicTemplateView.publish = true

            const userJc = new User(jcUserId, jcHash)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(publicTemplate)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)

            // if publication fails, it should throw an error
            await expect(GApi.templateSave(jcHash, publicTemplateView)).rejects.toBeInstanceOf(GApiError)
        })

        it('works with unpublished templates', async() => {
            jest.clearAllMocks()

            const templateId = 44;
            const privateTemplateView = new TemplateView(templateId, jcTestTemplateName, jcTestTemplateData, '', 1, false)
            const privateTemplate = new Template(templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription, 0, 0)

            const userJc = new User(jcUserId, jcHash)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(privateTemplate)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(1) // starting count

            const ts = await GApi.templateSave(jcHash, privateTemplateView)

            expect(ts.code).toBe(200) // because we had 1
            const t = ts.template
            expect(t.code).toBeUndefined()
            expect(t.publish).toBeFalsy()
            expect(t.id).toBe(templateId)
        })

        it('Can unpublish a previously published template', async () => {
            jest.clearAllMocks()

            const templateId = 11;
            const templateView = new TemplateView( templateId, 'name', {}, '', 1, false)
            expect(templateView.publish).toBeFalsy()
            const template = new Template(templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription, 0, 0)

            const userJc = new User(jcUserId, jcHash)
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(TemplateDao, 'createOrUpdate').mockResolvedValue(template)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(1) // starting count

            const ts = await GApi.templateSave(jcHash, templateView)

            expect(ts.code).toBe(200)
            expect(ts.template.publish).toBeFalsy()
            expect(ts.template.code).toBeUndefined()

            expect(PublicationDao.publish).toBeCalledTimes(0)
            expect(PublicationDao.unpublish).toBeCalledTimes(1)
            expect(PublicationDao.unpublish).lastCalledWith(templateView.id)
        })
    })

})