import { describe, expect, it, jest, afterAll } from '@jest/globals';
import { newTestUser } from './common';
import { UserView } from '../backend/models/UserView';
import { UserDao } from '../backend/dao/UserDao';
import { TemplateDao } from '../backend/TemplateDao';
import { User } from '../backend/models/User';
import { GApi } from '../backend/GApi';
import { jcHash, jcMaxTemplates, jcName } from './constants';

// Mock dependencies
jest.mock('../backend/dao/UserDao');
jest.mock('../backend/TemplateDao');
jest.mock('@vercel/postgres', () => ({
    sql: { end: jest.fn() }
}));

require('dotenv').config();


describe('UserView', () => {

    describe('constructor', () => {
        it('should create UserView instance with correct properties', () => {
            const user = newTestUser()
            const maxTemplates = 3
            const printCredits = 7
            user.setMaxTemplates(maxTemplates)
            user.setPrintCredits(printCredits)
            const userView = new UserView(user, [])
            expect(userView.sha256).toBe(user.sha256);
            expect(userView.name).toBe(user.name);
            expect(userView.accountType).toBe(user.accountType);
            expect(userView.printCredits).toBe(printCredits);
            expect(userView.templates).toHaveLength(0);
            expect(userView.templates).toHaveLength(0);
            expect(userView.maxTemp).toBe(maxTemplates)
            expect(userView.homeAirport).toBeUndefined()
        });

        it('should include homeAirport if set in User', () => {
            const user = newTestUser()
            user.setHomeAirport('KSQL')
            const userView = new UserView(user, [])
            expect(userView.homeAirport).toBe('KSQL')
        });

        it('should retrieve from hash', async () => {
            const mockUser = newTestUser();
            mockUser.sha256 = jcHash;
            mockUser.name = jcName;

            (UserDao.getUserFromHash as unknown as jest.Mock<any>).mockResolvedValue(mockUser);
            (TemplateDao.getOverviewListForUser as unknown as jest.Mock<any>).mockResolvedValue([]);

            const uv: UserView | undefined = await UserView.fromHash(jcHash)
            expect(uv).toBeDefined()
            if (!uv) return;
            expect(uv.sha256).toBe(jcHash)
            expect(uv.name).toBe(jcName)
            expect(uv.templates).toBeDefined()
        })

        it('should update home airport', async () => {
            const userId = 123
            const airportCode = 'KSEA'

            // Mock UserDao
            const mockUpdate = jest.fn().mockResolvedValue(true)
            jest.spyOn(UserDao.prototype, 'updateHomeAirport' as any).mockImplementation(mockUpdate)

            await GApi.setHomeAirport(userId, airportCode)
            expect(mockUpdate).toHaveBeenCalledWith(userId, airportCode)
        })
    });
});

