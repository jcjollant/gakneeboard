import { AccountType, PLAN_ID_SIM } from '@checklist/shared';
import { describe, expect, it, jest } from '@jest/globals';
import * as dotenv from 'dotenv';
import { GApiError } from '../backend/GApiError';
import { PublicationDao } from '../backend/PublicationDao';
import { TemplateDao } from '../backend/TemplateDao';
import { UsageDao } from '../backend/dao/UsageDao';
import { UserDao } from '../backend/dao/UserDao';
import { Publication } from '../backend/models/Publication';
import { Template } from '../backend/models/Template';
import { TemplateFormat } from '../backend/models/TemplateFormat';
import { TemplateView } from '../backend/models/TemplateView';
import { User } from '../backend/models/User';
import { TemplateService } from '../backend/services/TemplateService';
import { getMockTemplateDao, getTemplateView, newTestUser } from './common';
import { adminUserId, asUserId, jcHash, jcTestTemplateData, jcTestTemplateDescription, jcTestTemplateName, jcUserId, MAX_PAGES_BETA, MAX_TEMPLATE_BETA, MAX_TEMPLATE_PRIVATE, MAX_TEMPLATE_SIMMER, nonAdminUserId } from './constants';
dotenv.config()

const MAX_PAGES_MESSAGE = "Maximum pages reached"
const MAX_TEMPLATES_REACHED_MESSAGE = "Maximum templates reached"
const MAX_TEMPLATES_EXCEEDED_MESSAGE = "Maximum templates exceeded"

describe('TemplateService Tests', () => {

    describe('templateDelete', () => {
        it('Returns 404 on not found', async () => {
            const templateDao = new TemplateDao()
            jest.spyOn(templateDao, 'readById').mockResolvedValue(undefined)
            jest.spyOn(TemplateDao, 'getInstance').mockReturnValue(templateDao)
            // expect this to throw new GApiError(404, 'Template not found');
            await expect(TemplateService.delete(0, jcUserId)).rejects.toMatchObject({ status: 404 });
        })

        it('Succeeds with proper template', async () => {
            const templateId = 22
            const template = new Template(templateId, jcUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, undefined, 1, 2)
            const templateDao = new TemplateDao()
            jest.spyOn(templateDao, 'readById').mockResolvedValue(template)
            jest.spyOn(templateDao, 'delete').mockResolvedValue(templateId)
            jest.spyOn(TemplateDao, 'getInstance').mockReturnValue(templateDao)
            // jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(template);
            jest.spyOn(TemplateDao, 'deleteStatic').mockResolvedValue(1);

            const name = await TemplateService.delete(templateId, jcUserId)

            expect(name).toBe(jcTestTemplateName)
            expect(templateDao.delete).toBeCalledWith(templateId, jcUserId)
        })
    })


    describe('get', () => {
        it('Returns undefined for Invalid template', async () => {
            jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(undefined);

            const t = await TemplateService.get(0, jcUserId)
            expect(t).toBeUndefined()
        })

        it('Returns template with publication status', async () => {
            const template = new Template(0, jcUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, undefined, 1, 2)
            const templateView = TemplateView.parseTemplate(template)

            jest.spyOn(PublicationDao, 'findByTemplate').mockResolvedValue(undefined);
            jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(template)

            const tv = await TemplateService.get(0, jcUserId)
            expect(tv).toEqual(templateView)
            expect(tv?.publish).toBeFalsy()

            // now try with publication
            const publication = new Publication(0, 'code', template.id, true)
            jest.spyOn(PublicationDao, 'findByTemplate').mockResolvedValue(publication);

            const t2 = await TemplateService.get(0, jcUserId)
            expect(t2?.publish).toBeTruthy()
        })
        it('Request template without userId for admin user', async () => {
            const template = new Template(0, asUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, undefined, 1, 2)
            jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(template)

            const templateId = 0
            const tv = await TemplateService.get(templateId, adminUserId)
            expect(TemplateDao.readByIdStatic).toBeCalledWith(templateId, undefined)
        })
        it('Request template with userId for non admin user', async () => {
            const template = new Template(0, jcUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, undefined, 1, 2)
            jest.spyOn(TemplateDao, 'readByIdStatic').mockResolvedValue(template)

            const templateId = 0
            const tv = await TemplateService.get(templateId, nonAdminUserId)
            expect(TemplateDao.readByIdStatic).toBeCalledWith(templateId, nonAdminUserId)
        })
    })

    describe('templateGetList', () => {
        it('calls Dao', async () => {
            jest.spyOn(TemplateDao, 'getOverviewListForUser').mockResolvedValue([]);

            await TemplateService.getList(jcUserId)

            expect(TemplateDao.getOverviewListForUser).toBeCalledWith(jcUserId)
        })
    })

    describe('templateSave', () => {
        it('dodges invalid and unknown user', async () => {
            jest.clearAllMocks()
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(undefined)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)
            const template = new TemplateView(0, jcTestTemplateName, jcTestTemplateData)

            await expect(TemplateService.save(jcHash, template)).rejects.toEqual(new GApiError(400, "Invalid user"))
            expect(UserDao.getUserFromHash).toBeCalledWith(jcHash)

            await expect(TemplateService.save(null as unknown as string, template)).rejects.toEqual(new GApiError(400, "Invalid user"))
        })

        it('dodges invalid tempalte', async () => {
            jest.clearAllMocks()
            const simUser = newTestUser()
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)

            await expect(TemplateService.save(simUser.sha256, null as unknown as TemplateView)).rejects.toEqual(new GApiError(400, "Invalid template"))
        })

        it('Can create new template BELOW max but not AT max', async () => {
            jest.clearAllMocks()
            const simUserId = 55
            const simUser = newTestUser(simUserId, AccountType.simmer)

            const t = new Template(0, simUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, "Some Description", 1, 2)
            const tv = TemplateView.parseTemplate(t)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()
            // User below max
            const mockTemplateDao = new TemplateDao() as jest.Mocked<TemplateDao>;
            jest.spyOn(mockTemplateDao, 'createOrUpdate').mockResolvedValue(tv)
            jest.spyOn(mockTemplateDao, 'countForUser').mockResolvedValue(MAX_TEMPLATE_SIMMER - 1)
            jest.spyOn(mockTemplateDao, 'pageCount').mockResolvedValue([0, 0])
            jest.spyOn(TemplateDao, 'getInstance').mockReturnValue(mockTemplateDao)

            // User can create below max
            await TemplateService.save(simUser.sha256, tv).then(ts => {
                expect(ts.code).toBe(200)
            })

            // User at max
            jest.spyOn(mockTemplateDao, 'countForUser').mockResolvedValue(MAX_TEMPLATE_SIMMER)
            await expect(TemplateService.save(simUser.sha256, tv)).rejects.toEqual(new GApiError(402, MAX_TEMPLATES_REACHED_MESSAGE))

            // User over max
            jest.spyOn(mockTemplateDao, 'countForUser').mockResolvedValue(MAX_TEMPLATE_SIMMER + 1)
            await expect(TemplateService.save(simUser.sha256, tv)).rejects.toEqual(new GApiError(402, MAX_TEMPLATES_EXCEEDED_MESSAGE))

            // Boost Max Templates
            simUser.maxTemplates = MAX_TEMPLATE_SIMMER + 2;
            await TemplateService.save(simUser.sha256, tv).then(ts => {
                expect(ts.code).toBe(200)
            })

            expect(UsageDao.create).toBeCalledTimes(2)
        })

        it('Enforces Sim user page restrictions', async () => {
            const simUser = newTestUser(55, AccountType.simmer, PLAN_ID_SIM)
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)

            const tv4pages = getTemplateView(4)

            // disable unpublish
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()
            getMockTemplateDao(tv4pages, MAX_TEMPLATE_SIMMER - 1)

            // Sim user cannot save more than two pages on new templates
            await expect(TemplateService.save(simUser.sha256, tv4pages)).rejects.toEqual(new GApiError(402, MAX_PAGES_MESSAGE))

            // Sim user cannot save more than two pages when keeping page size
            tv4pages.id = 1
            await expect(TemplateService.save(simUser.sha256, tv4pages)).rejects.toEqual(new GApiError(402, MAX_PAGES_MESSAGE))

            // Sim user can save more than two pages when reducing page size
            const tv3pages = getTemplateView(3, 1)

            getMockTemplateDao(tv3pages, MAX_TEMPLATE_SIMMER - 1, 4, 4)

            await TemplateService.save(simUser.sha256, tv3pages).then(ts => {
                expect(ts.code).toBe(200)
            })
        })

        it('Enforces Beta user page restriction', async () => {
            // Beta users can save maxPages
            const betaUser = newTestUser(66, AccountType.beta, 'bd1')
            const tvMax = getTemplateView(MAX_PAGES_BETA, 1)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(betaUser)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()
            //
            const mockTemplateDao = getMockTemplateDao(tvMax, MAX_TEMPLATE_BETA, 0, 0)

            // Should be able to update a template at max pages
            await TemplateService.save(betaUser.sha256, tvMax).then(ts => {
                expect(ts.code).toBe(200)
            })

            // Should not be able to update over max pages
            const tvOVerMax = getTemplateView(MAX_PAGES_BETA + 1, 1)
            await expect(TemplateService.save(betaUser.sha256, tvOVerMax)).rejects.toEqual(new GApiError(402, MAX_PAGES_MESSAGE))

            // Should be able update over max when decreasing page count
            // We are decreasing from MAX+2 to MAX+1
            jest.spyOn(mockTemplateDao, 'pageCount').mockResolvedValue([MAX_PAGES_BETA + 10, MAX_PAGES_BETA + 2])
            await TemplateService.save(betaUser.sha256, tvMax).then(ts => {
                expect(ts.code).toBe(200)
            })
        })

        it('Can save existing template AT max but not OVER max', async () => {
            jest.clearAllMocks()
            const simUserId = 55
            const simUser = newTestUser(simUserId, AccountType.simmer)
            const templateId = 66
            const publicTemplate = new Template(templateId, jcUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, jcTestTemplateDescription, 0, 0)
            const publicTemplateView = TemplateView.parseTemplate(publicTemplate)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(simUser)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)

            const mockTemplateDao = getMockTemplateDao(publicTemplateView)

            // User already has max templates
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()

            const tv = new TemplateView(1, jcTestTemplateName, jcTestTemplateData)

            await TemplateService.save(simUser.sha256, tv).then(ts => {
                expect(ts.code).toBe(200)
            })

            // One above should fail
            jest.spyOn(mockTemplateDao, 'countForUser').mockResolvedValue(MAX_TEMPLATE_SIMMER + 1)
            await expect(TemplateService.save(simUser.sha256, tv)).rejects.toEqual(new GApiError(402, MAX_TEMPLATES_EXCEEDED_MESSAGE))

            // Boost Max Templates
            simUser.maxTemplates = MAX_TEMPLATE_SIMMER * 2
            await TemplateService.save(simUser.sha256, tv).then(ts => {
                expect(ts.code).toBe(200)
            })
        })

        it('finds publication code', async () => {
            jest.clearAllMocks()
            const templateId = 33;
            const publicTemplateView = new TemplateView(templateId, jcTestTemplateName, jcTestTemplateData)
            publicTemplateView.publish = true
            const publicationCode = 'ZZ'
            const publication = new Publication(0, publicationCode, publicTemplateView.id, true)

            const userJc = newTestUser(jcUserId, AccountType.private, 'pp2')
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(publication)
            const mockTemplateDao = getMockTemplateDao(publicTemplateView, MAX_TEMPLATE_PRIVATE - 1, 2, 0)

            const ts = await TemplateService.save(jcHash, publicTemplateView)
            const t = ts.template

            expect(t.code).toBe(publicationCode)
            expect(t.publish).toBeTruthy()
            expect(t.id).toBe(publicTemplateView.id)

            expect(mockTemplateDao.createOrUpdate).lastCalledWith(t, jcUserId)
            expect(PublicationDao.publish).lastCalledWith(publicTemplateView.id)
        })

        it('sends error if publication failed', async () => {
            jest.clearAllMocks()

            const templateId = 33;
            const publicTemplateView = new TemplateView(templateId, jcTestTemplateName, jcTestTemplateData)
            publicTemplateView.publish = true

            const userJc = new User(jcUserId, jcHash)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)
            getMockTemplateDao(publicTemplateView)
            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)

            // if publication fails, it should throw an error
            await expect(TemplateService.save(jcHash, publicTemplateView)).rejects.toBeInstanceOf(GApiError)
        })

        it('works with unpublished templates', async () => {
            jest.clearAllMocks()

            const templateId = 44;
            const privateTemplateView = new TemplateView(templateId, jcTestTemplateName, ['a', 'b'], TemplateFormat.Kneeboard, '', 1, false)

            const userJc = newTestUser(jcUserId, AccountType.private, 'pp2')
            expect(userJc.maxTemplates).toBe(MAX_TEMPLATE_PRIVATE)

            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)
            const mockTemplateDao = new TemplateDao() as jest.Mocked<TemplateDao>;
            jest.spyOn(mockTemplateDao, 'createOrUpdate').mockResolvedValue(privateTemplateView)
            jest.spyOn(mockTemplateDao, 'countForUser').mockResolvedValue(1) // starting count
            jest.spyOn(mockTemplateDao, 'pageCount').mockResolvedValue([2, 0]) // we had 2 pages before
            jest.spyOn(TemplateDao, 'getInstance').mockReturnValue(mockTemplateDao)

            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)

            const ts = await TemplateService.save(jcHash, privateTemplateView)

            expect(ts.code).toBe(200) // because we had 1
            const t = ts.template
            expect(t.code).toBeUndefined()
            expect(t.publish).toBeFalsy()
            expect(t.id).toBe(templateId)
        })

        it('Can unpublish a previously published template', async () => {
            jest.clearAllMocks()

            const templateId = 11;
            const templateView = new TemplateView(templateId, 'name', {}, TemplateFormat.Kneeboard, '', 1, false)
            expect(templateView.publish).toBeFalsy()
            const template = new Template(templateId, jcUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, jcTestTemplateDescription, 0, 0)

            const userJc = new User(jcUserId, jcHash)
            userJc.maxTemplates = 2
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue(userJc)
            jest.spyOn(UsageDao, 'create').mockResolvedValue(true)
            getMockTemplateDao(templateView, 1)

            jest.spyOn(PublicationDao, 'publish').mockResolvedValue(undefined)
            jest.spyOn(PublicationDao, 'unpublish').mockResolvedValue()

            const ts = await TemplateService.save(jcHash, templateView)

            expect(ts.code).toBe(200)
            expect(ts.template.publish).toBeFalsy()
            expect(ts.template.code).toBeUndefined()

            expect(PublicationDao.publish).toBeCalledTimes(0)
            expect(PublicationDao.unpublish).toBeCalledTimes(1)
            expect(PublicationDao.unpublish).lastCalledWith(templateView.id)
        })
    })

})