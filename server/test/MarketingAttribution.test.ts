import { describe, expect, test, it, jest, beforeAll, afterAll } from '@jest/globals';
import { UserTools } from '../backend/UserTools';
import { UserDao } from '../backend/dao/UserDao';
import { Email } from '../backend/Email';
import { AttributionData } from '../backend/models/AttributionData';
import { User } from '../backend/models/User';
import * as dotenv from 'dotenv';
import { brandNewUser } from './common';

dotenv.config();

describe('Marketing Attribution', () => {

    beforeAll(() => {
        jest.spyOn(Email, 'send').mockResolvedValue(true);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should save attribution data during user signup', async () => {
        const attribution: AttributionData = {
            source: 'google',
            medium: 'cpc',
            campaign: 'summer_sale',
            term: 'running shoes',
            content: 'banner_ad',
            timestamp: Date.now()
        };

        const testUser = brandNewUser();
        // Mock body with attribution
        const body = {
            source: testUser.source,
            token: testUser.sha256,
            testUser: testUser,
            attribution: attribution
        };

        const mockUserDao = new UserDao() as jest.Mocked<UserDao>;

        // Mock getFromHash to return undefined (indicating new user)
        jest.spyOn(mockUserDao, 'getFromHash').mockResolvedValue(undefined);

        // Mock save to simply return the user with an ID
        jest.spyOn(mockUserDao, 'save').mockImplementation(async (u: User) => {
            u.id = 123;
            // Verify attribution is set on the user being saved
            expect(u.attribution).toEqual(attribution);
            return u;
        });

        const newUser = await UserTools.authenticate(body, mockUserDao);

        expect(newUser.attribution).toEqual(attribution);
        expect(mockUserDao.save).toHaveBeenCalledTimes(1);
    });

    it('should ignore attribution if not present', async () => {
        const testUser = brandNewUser();
        const body = {
            source: testUser.source,
            token: testUser.sha256,
            testUser: testUser
        };

        const mockUserDao = new UserDao() as jest.Mocked<UserDao>;
        jest.spyOn(mockUserDao, 'getFromHash').mockResolvedValue(undefined);
        jest.spyOn(mockUserDao, 'save').mockImplementation(async (u: User) => {
            u.id = 456;
            expect(u.attribution).toBeUndefined();
            return u;
        });

        const newUser = await UserTools.authenticate(body, mockUserDao);
        expect(newUser.attribution).toBeUndefined();
    });

    it('should correctly parse attribution data in UserDao', () => {
        const attribution: AttributionData = {
            source: 'newsletter',
            medium: 'email',
            campaign: 'winter_update',
            term: 'skiing',
            content: 'link',
            timestamp: 1234567890
        };

        const row = {
            id: 1,
            sha256: 'some_hash',
            data: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                source: 'google',
                attribution: attribution
            }),
            account_type: 'free',
            max_pages: 10,
            max_templates: 5,
            print_credit: 0,
            create_time: new Date(),
            customer_id: 'cust_123',
            eula: 1
        };

        const dao = new UserDao();
        const user = dao.parseRow(row);

        expect(user.attribution).toEqual(attribution);
        expect(user.name).toBe('John Doe');
    });
});
