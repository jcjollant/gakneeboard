import { describe, expect, test, afterAll, jest, beforeEach } from '@jest/globals';
import { GApi } from '../backend/GApi';
import { UserMiniView } from '../backend/models/UserMiniView';
import { UserTools } from '../backend/UserTools';
import { UserDao } from '../backend/dao/UserDao';
import { UsageDao } from '../backend/dao/UsageDao';
import { TemplateDao } from '../backend/TemplateDao';
import { AirportService } from '../backend/services/AirportService';
import { jcHash, jcName, jcToken, jcUserId } from './constants';
import { User } from '../backend/models/User';
import { AccountType } from '@checklist/shared';

// Mock dependencies
jest.mock('../backend/UserTools');
jest.mock('../backend/dao/UserDao');
jest.mock('../backend/dao/UsageDao');
jest.mock('../backend/TemplateDao');
jest.mock('../backend/services/AirportService');
jest.mock('@vercel/postgres', () => ({
    sql: { end: jest.fn() }
}));

import * as dotenv from 'dotenv';
dotenv.config()

describe('GApi Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Authenticate', async () => {
        const body = { 'source': UserTools.google, 'token': jcToken };

        // Mock UserTools.authenticate
        const mockUser = new User(jcUserId, jcHash);
        mockUser.name = jcName;
        mockUser.accountType = AccountType.private;
        (UserTools.authenticate as unknown as jest.Mock<any>).mockResolvedValue(mockUser);

        // Mock TemplateDao.getOverviewListForUser
        (TemplateDao.getOverviewListForUser as unknown as jest.Mock<any>).mockResolvedValue([]);

        await GApi.authenticate(body).then((user: UserMiniView) => {
            expect(user.name).toBe(jcName)
            expect(user.sha256).toBe(jcHash)
            expect(user.templates).toBeDefined()
        }).catch((e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        });
    })

    test('shaToid', async () => {
        (UserDao.getIdFromHash as unknown as jest.Mock<any>).mockResolvedValue(jcUserId);

        await GApi.userShaToId(jcHash).then(id => {
            expect(id).toBe(jcUserId)
        }).catch((e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        });

        // Bogus Hash should return undefined
        (UserDao.getIdFromHash as unknown as jest.Mock<any>).mockResolvedValue(undefined);
        await GApi.userShaToId('bogusHash').then(id => {
            expect(id).toBeUndefined()
        }).catch((e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        });
    })

    test('Session', async () => {
        // Mock session dependencies
        (AirportService.getAirportCurrentEffectiveDate as unknown as jest.Mock<any>).mockReturnValue('2024-01-01');
        // AirportView.currentVersion is a static property, hard to mock if it's just a value 
        // derived from import. But GApi reads it. If it's undefined, it's fine.

        const req1 = {}
        const session1 = await GApi.getSession(req1);
        expect(session1).toBeDefined()
        expect(session1.version).toBeDefined()
        expect(session1.aced).toBeDefined()
        expect(session1.camv).toBeDefined()
        expect(session1.user).toBeUndefined();

        // Mock user session part
        (UserTools.userShaFromRequest as unknown as jest.Mock<any>).mockReturnValue(jcHash);
        const mockUser = new User(jcUserId, jcHash);
        (UserDao.getUserFromHash as unknown as jest.Mock<any>).mockResolvedValue(mockUser);
        (UserTools.userMini as unknown as jest.Mock<any>).mockResolvedValue({ sha256: jcHash } as UserMiniView);

        const req2 = { query: { user: jcHash } }
        const session2 = await GApi.getSession(req2)
        expect(session2).toBeDefined()
        expect(session2.version).toBeDefined()
        expect(session2.aced).toBeDefined()
        expect(session2.camv).toBeDefined()
        expect(session2.user).toBeDefined()
    })

    afterAll(async () => {
        // await sql.end() // Removed
    })
})
