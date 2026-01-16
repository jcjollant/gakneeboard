import { describe, expect, test, it, jest, beforeAll, afterAll } from '@jest/globals';
import { User } from '../backend/models/User'
import { UserTools } from '../backend/UserTools'
import { jcSource } from './constants'
import { jcHash, jcUserId, jcToken, jcName, jcEmail } from './constants'
import { UserMiniView } from '../backend/models/UserMiniView';
import { AccountType } from '../backend/models/AccountType';
import { Business } from '../backend/business/Business';
import { UserDao } from '../backend/dao/UserDao';
import { Email } from '../backend/Email';

import * as dotenv from 'dotenv'
import { brandNewUser, newTestUser } from './common';
dotenv.config()

const jc = { 'source': UserTools.google, 'email': jcEmail }

describe('User', () => {
    test('Encryption', async () => {
        expect(User.createSha256(jc)).toBe(jcHash)
        expect(UserTools.createUserSha(jcSource, jcEmail)).toBe(jcHash)
    })

    test('Constructor', () => {
        const hash = 'hash'
        const u = new User(1, hash)
        expect(u.id).toBe(1)
        expect(u.sha256).toBe(hash)
        expect(u.source).toBe('')
        expect(u.email).toBe('')
        expect(u.name).toBe('')
        expect(u.maxTemplates).toBe(Business.MAX_TEMPLATE_SIMMER)
        expect(u.accountType).toBe(AccountType.simmer)
        expect(u.printCredits).toBe(0)
    })

    test('setters', () => {
        const u = new User(1, 'hash')
        u.setEmail('email')
        u.setSource('source')
        u.setMaxTemplates(10)
        u.setName('name')
        const expectedPrintCredits = 11;
        u.setPrintCredits(expectedPrintCredits)
        expect(u.email).toBe('email')
        expect(u.source).toBe('source')
        expect(u.maxTemplates).toBe(10)
        expect(u.name).toBe('name')
        expect(u.printCredits).toBe(expectedPrintCredits)
    })

})

describe('UserTool', () => {
    // Mock email sending to avoid cluttering the inbox
    beforeAll(() => {
        jest.spyOn(Email, 'send').mockResolvedValue(true)
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    it('Authenticate gives print credit', async () => {
        const body = { 'source': UserTools.google, 'token': jcToken }

        const mockUserDao = new UserDao() as jest.Mocked<UserDao>;
        // user doesn't exist
        jest.spyOn(mockUserDao, 'getFromHash').mockResolvedValue(undefined)
        jest.spyOn(mockUserDao, 'save').mockImplementation(u => new Promise(res => res(u)))

        const user = await UserTools.authenticate(body, mockUserDao)

        // should have default credit for simmer
        expect(user.printCredits).toBe(Business.PRINT_CREDIT_SIMMER)
    })
    it('new user creation give credit and max templates', async () => {
        const testUser = brandNewUser()
        const body = { source: testUser.source, token: testUser.sha256, testUser: testUser }

        const mockUserDao = new UserDao() as jest.Mocked<UserDao>;
        jest.spyOn(mockUserDao, 'getFromHash').mockResolvedValue(undefined)
        jest.spyOn(mockUserDao, 'save').mockImplementation(u => new Promise(res => res(u)))

        const newUser = await UserTools.authenticate(body, mockUserDao)
        expect(newUser.printCredits).toBe(Business.PRINT_CREDIT_SIMMER)
        expect(newUser.maxTemplates).toBe(Business.MAX_TEMPLATE_SIMMER)
        expect(newUser.maxPages).toBe(Business.MAX_PAGES_SIMMER)

        // Cannot check savedUser via dao since we mocked it and didn't implement back store.
        // We can verify mock call if needed, but the original test checked logic on returned object from dao.
    })
    it('new user creation with empty name defaults to user', async () => {
        const testUser = brandNewUser()
        testUser.name = '' // Ensure name is empty
        const body = { source: testUser.source, token: testUser.sha256, testUser: testUser }

        const mockUserDao = new UserDao() as jest.Mocked<UserDao>;
        jest.spyOn(mockUserDao, 'getFromHash').mockResolvedValue(undefined)
        jest.spyOn(mockUserDao, 'save').mockImplementation(u => new Promise(res => res(u)))

        const newUser = await UserTools.authenticate(body, mockUserDao)
        expect(newUser.name).toBe('user')
    })
    test('Authenticate and UserMiniView', async () => {
        const body = { 'source': UserTools.google, 'token': jcToken }

        const mockUserDao = new UserDao() as jest.Mocked<UserDao>;
        // user doesn't exist
        jest.spyOn(mockUserDao, 'getFromHash').mockResolvedValue(new User(0, jcHash)) // Should probably exist for this test based on expectations
        // Actually looking at the test, it expects a user to be returned. 
        // If authenticate is called with just body, it creates a new UserDao internally which is the problem.
        // UserTools.authenticate has an optional parameter for UserDao.
        // We need to inject the mock.

        jest.spyOn(UserDao.prototype, 'getFromHash').mockResolvedValue(new User(0, jcHash))

        // However, `UserTools.authenticate` creates `new UserDao()` if not passed.
        // The `Authenticate and UserMiniView` test calls `UserTools.authenticate(body)` without dao.
        // We should mock UserDao constructor or the method prototype.

        // Simpler approach: Spy on UserDao prototype methods
        const mockUser = new User(1, jcHash)
        mockUser.setSource(UserTools.google)
        mockUser.setEmail(jcEmail)
        mockUser.setName(jcName)

        jest.spyOn(UserDao.prototype, 'getFromHash').mockResolvedValue(mockUser)
        jest.spyOn(UserDao.prototype, 'save').mockResolvedValue(mockUser)

        const user = await UserTools.authenticate(body)
        // console.log('user '+JSON.stringify(user))
        expect(user.source).toBe(UserTools.google)
        expect(user.email).toBe(jcEmail)
        expect(user.sha256).toBe(jcHash)

        const miniUser: UserMiniView = new UserMiniView(user, [])
        // should only have sha256 and name
        expect(miniUser.sha256).toBe(jcHash)
        expect(miniUser.name).toBe(jcName)
        expect(miniUser['source']).toBeUndefined()
        expect(miniUser['email']).toBeUndefined()

        const body2 = {}
        await UserTools.authenticate(body2).then(() => {
            expect(true).toBe(false)
        }).catch((err) => {
            expect(err.message).toBe('Missing source')
        })

        const body3 = { 'source': 'notgoogle', 'token': 'sometoken' }
        await UserTools.authenticate(body3).then(() => {
            expect(true).toBe(false)
        }).catch((err) => {
            expect(err.message).toBe('Invalid source')
        })
    })

    test('userIdFromRequest', async () => {
        jest.spyOn(UserDao, 'getIdFromHash').mockResolvedValue(undefined)
        expect(await UserTools.userIdFromRequest(undefined)).toBeUndefined()
        const req1 = {}
        expect(await UserTools.userIdFromRequest(req1)).toBeUndefined()
        const req2 = { query: {} }
        expect(await UserTools.userIdFromRequest(req2)).toBeUndefined()
        const req3 = { query: { user: {} } }
        expect(await UserTools.userIdFromRequest(req3)).toBeUndefined()

        jest.spyOn(UserDao, 'getIdFromHash').mockResolvedValue(jcUserId)
        const req4 = { query: { user: jcHash } }
        expect(await UserTools.userIdFromRequest(req4)).toBe(jcUserId)
    })

})