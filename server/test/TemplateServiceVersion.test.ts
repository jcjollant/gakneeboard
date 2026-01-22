import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { TemplateService } from '../backend/services/TemplateService';
import { UserDao } from '../backend/dao/UserDao';
import { UsageDao } from '../backend/dao/UsageDao';
import { TemplateHistoryDao, TemplateHistory, TemplateOperation } from '../backend/dao/TemplateHistoryDao';
import { TemplateDao } from '../backend/TemplateDao';
import { TemplateView } from '../backend/models/TemplateView';
import { Template } from '../backend/models/Template';
import { User } from '../backend/models/User';
import { AccountType, PLAN_ID_SIM } from '@checklist/shared';
import { GApiError } from '../backend/GApiError';
import { TemplateFormat } from '../backend/models/TemplateFormat';

// Mock dependencies
jest.mock('../backend/dao/UserDao');
jest.mock('../backend/dao/UsageDao');
jest.mock('../backend/dao/TemplateHistoryDao');
// We don't fully mock TemplateDao because it has static methods that might be complex to mock if the class is auto-mocked
// But let's try auto-mocking first.
jest.mock('../backend/TemplateDao');

const mockUserDao = UserDao as jest.MockedClass<typeof UserDao>;
const mockHistoryDao = TemplateHistoryDao as jest.MockedClass<typeof TemplateHistoryDao>;
const mockTemplateDao = TemplateDao as jest.MockedClass<typeof TemplateDao>;

describe('TemplateService.getVersion', () => {
    const userId = 1;
    const templateId = 100;
    const version = 5;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw 401 if user not found', async () => {
        // Setup mock for new UserDao().get()
        mockUserDao.prototype.get.mockResolvedValue(undefined as any);

        await expect(TemplateService.getVersion(templateId, version, userId))
            .rejects.toEqual(new GApiError(401, 'Unauthorized'));
    });

    it('should throw 403 if user is sim', async () => {
        const simUser = new User(userId, 'hash');
        simUser.accountType = AccountType.simmer;
        simUser.planId = PLAN_ID_SIM;
        mockUserDao.prototype.get.mockResolvedValue(simUser);

        await expect(TemplateService.getVersion(templateId, version, userId))
            .rejects.toEqual(new GApiError(403, 'Your plan does not allow you to restore old versions'));
    });

    it('should return history version if found', async () => {
        const validUser = new User(userId, 'hash');
        validUser.accountType = AccountType.private;
        mockUserDao.prototype.get.mockResolvedValue(validUser);

        const history = {
            id: 1,
            templateId: templateId,
            userId: userId,
            data: { foo: 'bar' },
            name: 'Name',
            version: version,
            description: 'Desc',
            pages: 1,
            thumbnail: 'thumb',
            thumbhash: 'hash',
            operation: 'UPDATE',
            createdAt: new Date()
        } as unknown as TemplateHistory;
        mockHistoryDao.prototype.getTemplateVersion.mockResolvedValue(history);

        // Mock current template to get format
        const current = new Template(templateId, userId, {}, TemplateFormat.Kneeboard, 'Name', 'Desc', 6, 1);
        // Static method mock
        (mockTemplateDao.readByIdStatic as unknown as jest.Mock).mockResolvedValue(current);

        const result = await TemplateService.getVersion(templateId, version, userId);
        expect(result).toBeDefined();
        expect(result?.id).toBe(templateId);
        expect(result?.ver).toBe(version);
        expect(result?.format).toBe(TemplateFormat.Kneeboard);
        expect(result?.data).toEqual({ foo: 'bar' });
    });

    it('should throw 404 if history found but wrong user', async () => {
        const validUser = new User(userId, 'hash');
        validUser.accountType = AccountType.private;
        mockUserDao.prototype.get.mockResolvedValue(validUser);

        const history = {
            id: 1,
            templateId: templateId,
            userId: 999, // Wrong user
            data: {},
            name: 'Name',
            version: version,
            description: 'Desc',
            pages: 1,
            thumbnail: null,
            thumbhash: null,
            operation: 'UPDATE',
            createdAt: new Date()
        } as unknown as TemplateHistory;
        mockHistoryDao.prototype.getTemplateVersion.mockResolvedValue(history);

        await expect(TemplateService.getVersion(templateId, version, userId))
            .rejects.toEqual(new GApiError(404, 'Template not found'));
    });

    it('should return current version if history not found but current matches', async () => {
        const validUser = new User(userId, 'hash');
        validUser.accountType = AccountType.private;
        mockUserDao.prototype.get.mockResolvedValue(validUser);
        mockHistoryDao.prototype.getTemplateVersion.mockResolvedValue(undefined);

        const current = new Template(templateId, userId, { current: true }, TemplateFormat.Kneeboard, 'Name', 'Desc', version, 1);
        (mockTemplateDao.readByIdStatic as unknown as jest.Mock).mockResolvedValue(current);

        const result = await TemplateService.getVersion(templateId, version, userId);
        expect(result).toBeDefined();
        expect(result?.ver).toBe(version);
        expect((result?.data as any).current).toBe(true);
    });

    it('should throw 404 if neither history nor current matches', async () => {
        const validUser = new User(userId, 'hash');
        validUser.accountType = AccountType.private;
        mockUserDao.prototype.get.mockResolvedValue(validUser);
        mockHistoryDao.prototype.getTemplateVersion.mockResolvedValue(undefined);

        const current = new Template(templateId, userId, {}, TemplateFormat.Kneeboard, 'Name', 'Desc', version + 1, 1);
        (mockTemplateDao.readByIdStatic as unknown as jest.Mock).mockResolvedValue(current);

        await expect(TemplateService.getVersion(templateId, version, userId))
            .rejects.toEqual(new GApiError(404, 'Version not found'));
    });

    it('should throw 404 if neither history nor current found', async () => {
        const validUser = new User(userId, 'hash');
        validUser.accountType = AccountType.private;
        mockUserDao.prototype.get.mockResolvedValue(validUser);
        mockHistoryDao.prototype.getTemplateVersion.mockResolvedValue(undefined);

        (mockTemplateDao.readByIdStatic as unknown as jest.Mock).mockResolvedValue(undefined);

        await expect(TemplateService.getVersion(templateId, version, userId))
            .rejects.toEqual(new GApiError(404, 'Version not found'));
    });
});
