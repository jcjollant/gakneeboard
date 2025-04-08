import { describe, expect, it, jest} from '@jest/globals';
import { GApi } from '../backend/GApi'
import { jcHash, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription } from './constants'
import { TemplateDao } from '../backend/TemplateDao';
import { PublicationDao } from '../backend/PublicationDao';
import { Publication } from '../backend/models/Publication';
import { UserDao } from '../backend/dao/UserDao';
import { TemplateView } from '../backend/models/TemplateView';
import { Template } from '../backend/models/Template';
import { User } from '../backend/models/User';
import { newTestUser } from './common';
import { Business } from '../backend/business/Business';
import { AccountType } from '../backend/models/AccountType';

import * as dotenv from 'dotenv'
import { GApiTemplate } from '../backend/GApiTemplate';
import { GApiError } from '../backend/GApiError';
dotenv.config()

describe( 'GApiTemplate Tests', () => {

    describe('templateDelete', () => {
        it('Returns 404 on not found', async () => {
            jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(undefined);
            // expect this to throw new GApiError(404, 'Template not found');
            await expect(GApiTemplate.delete(0, jcUserId)).rejects.toMatchObject({status:404});
        })

        it('Succeeds with proper template', async () => {
            const templateId = 22
            const template = new Template( templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, undefined, 1, 2)
            const templateDao = new TemplateDao()
            jest.spyOn(templateDao, 'readById').mockResolvedValue(template)
            jest.spyOn(templateDao, 'delete').mockResolvedValue(templateId)
            jest.spyOn(TemplateDao, 'getInstance').mockReturnValue(templateDao)
            // jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(template);
            jest.spyOn(TemplateDao, 'deleteStatic').mockResolvedValue(1);

            const name = await GApiTemplate.delete( templateId, jcUserId)

            expect(name).toBe(jcTestTemplateName)
            expect(templateDao.delete).toBeCalledWith(templateId, jcUserId)
        })
    })


    describe('get', () => {
        it('Returns undefined for Invalid template', async () => {
            jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(undefined);

            const t = await GApiTemplate.get(0,jcUserId)
            expect(t).toBeUndefined()
        })

        it('Returns template with publication status', async () => {
            const template = new Template( 0, jcUserId, jcTestTemplateData, jcTestTemplateName, undefined, 1, 2)
            const templateView = TemplateView.parseTemplate(template)

            jest.spyOn(PublicationDao, 'findByTemplate').mockResolvedValue(undefined);
            jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(template)

            const tv = await GApiTemplate.get(0,jcUserId)
            expect(tv).toEqual(templateView)
            expect(tv?.publish).toBeFalsy()

            // now try with publication
            const publication = new Publication(0, 'code', template.id, true)
            jest.spyOn(PublicationDao, 'findByTemplate').mockResolvedValue(publication);

            const t2 = await GApiTemplate.get(0,jcUserId)
            expect(t2?.publish).toBeTruthy()
        })
    })

    describe('templateGetList', () => {
        it('calls Dao', async () => {
            jest.spyOn(TemplateDao, 'getOverviewListForUser').mockResolvedValue([]);

            await GApiTemplate.getList(jcUserId)

            expect(TemplateDao.getOverviewListForUser).toBeCalledWith(jcUserId)
        })
    })

    describe('templateSave', () => {
        it('dodges invalid and unknown user', async () => {
            jest.clearAllMocks()
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(undefined)
            const template = new TemplateView(0, jcTestTemplateName, jcTestTemplateData)

            await expect(GApiTemplate.save(jcHash, template)).rejects.toEqual(new GApiError(400, "Invalid user"))
            expect(UserDao.getUserFromHash).toBeCalledWith(jcHash)

            await expect(GApiTemplate.save(null as unknown as string, template)).rejects.toEqual(new GApiError(400, "Invalid user"))
        })

        it('dodges invalid tempalte', async () => {
            jest.clearAllMocks()
            const simUser = newTestUser()
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)

            await expect(GApiTemplate.save(simUser.sha256, null as unknown as TemplateView)).rejects.toEqual(new GApiError(400, "Invalid template"))
        })

        it('Can create new template BELOW max but not AT max', async () => {
            jest.clearAllMocks()
            const simUserId = 55
            const simUser = newTestUser(simUserId)
            simUser.accountType = AccountType.simmer

            const t = new Template(0, simUserId, jcTestTemplateData, jcTestTemplateName, "Some Description", 1, 2)
            const tv = TemplateView.parseTemplate(t)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)
            // User below max
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER - 1)
            jest.spyOn(TemplateDao, 'createOrUpdateView').mockResolvedValue(tv)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()

            await GApiTemplate.save(simUser.sha256, tv).then( ts => {
                expect(ts.code).toBe(200)
            })

            // User at max
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER)
            await expect(GApiTemplate.save(simUser.sha256, tv)).rejects.toEqual(new GApiError( 402, "Maximum templates reached"))

            // User over max
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER + 1)
            await expect(GApiTemplate.save(simUser.sha256, tv)).rejects.toEqual(new GApiError( 402, "Maximum templates exceeded"))

            // Boost Max Templates
            simUser.maxTemplates = Business.MAX_TEMPLATE_SIMMER * 2
            await GApiTemplate.save(simUser.sha256, tv).then( ts => {
                expect(ts.code).toBe(200)
            })
        })

        it('Can save existing template AT max but not OVER max', async () => {
            jest.clearAllMocks()
            const simUserId = 55
            const simUser = newTestUser(simUserId, AccountType.simmer)
            simUser.accountType = AccountType.simmer
            const templateId = 66
            const publicTemplate = new Template(templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription, 0, 0)
            const publicTemplateView = TemplateView.parseTemplate(publicTemplate)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)
            jest.spyOn(TemplateDao, 'createOrUpdateView').mockResolvedValue(publicTemplateView)
            // User already has max templates
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()

            const tv = new TemplateView(1, jcTestTemplateName, jcTestTemplateData)

            await GApiTemplate.save(simUser.sha256, tv).then( ts => {
                expect(ts.code).toBe(200)
            })

            // One above should fail
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER + 1)
            await expect(GApiTemplate.save(simUser.sha256, tv)).rejects.toEqual(new GApiError( 402, "Maximum templates exceeded"))

            // Boost Max Templates
            simUser.maxTemplates = Business.MAX_TEMPLATE_SIMMER * 2
            await GApiTemplate.save(simUser.sha256, tv).then( ts => {
                expect(ts.code).toBe(200)
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
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(Business.MAX_TEMPLATE_SIMMER - 1)
            jest.spyOn(TemplateDao, 'createOrUpdateView').mockResolvedValue(publicTemplateView)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(publication)

            const ts = await GApiTemplate.save(jcHash, publicTemplateView)
            const t = ts.template

            expect(t.code).toBe(publicationCode)
            expect(t.publish).toBeTruthy()
            expect(t.id).toBe(publicTemplateView.id)

            expect(TemplateDao.createOrUpdateView).lastCalledWith(t, jcUserId)
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
            jest.spyOn(TemplateDao, 'createOrUpdateView').mockResolvedValue(publicTemplateView)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)

            // if publication fails, it should throw an error
            await expect(GApiTemplate.save(jcHash, publicTemplateView)).rejects.toBeInstanceOf(GApiError)
        })

        it('works with unpublished templates', async() => {
            jest.clearAllMocks()

            const templateId = 44;
            const privateTemplateView = new TemplateView(templateId, jcTestTemplateName, jcTestTemplateData, '', 1, false)
            const privateTemplate = new Template(templateId, jcUserId, jcTestTemplateData, jcTestTemplateName, jcTestTemplateDescription, 0, 0)

            const userJc = new User(jcUserId, jcHash)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(TemplateDao, 'createOrUpdateView').mockResolvedValue(privateTemplateView)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(1) // starting count

            const ts = await GApiTemplate.save(jcHash, privateTemplateView)

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
            jest.spyOn(TemplateDao, 'createOrUpdateView').mockResolvedValue(templateView)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()
            jest.spyOn(TemplateDao, 'countForUser').mockResolvedValue(1) // starting count

            const ts = await GApiTemplate.save(jcHash, templateView)

            expect(ts.code).toBe(200)
            expect(ts.template.publish).toBeFalsy()
            expect(ts.template.code).toBeUndefined()

            expect(PublicationDao.publish).toBeCalledTimes(0)
            expect(PublicationDao.unpublish).toBeCalledTimes(1)
            expect(PublicationDao.unpublish).lastCalledWith(templateView.id)
        })
    })

})