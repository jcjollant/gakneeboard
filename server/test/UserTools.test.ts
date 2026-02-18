import { describe, expect, it, jest, afterEach, beforeEach } from '@jest/globals';
import { UserTools } from '../backend/UserTools';
import { User } from '../backend/models/User';
import { AttributionData } from '../backend/models/AttributionData';

// Mock Email
jest.mock('../backend/Email', () => {
    return {
        Email: {
            send: jest.fn(),
        },
        EmailType: {
            NewUser: 2,
        }
    };
});
import { Email, EmailType } from '../backend/Email';

// Mock UserDao
jest.mock('../backend/dao/UserDao', () => {
    return {
        UserDao: jest.fn().mockImplementation(() => {
            return {
                getFromHash: jest.fn(),
                save: jest.fn(),
            };
        })
    };
});
import { UserDao } from '../backend/dao/UserDao';

// Mock Business to avoid complex logic if needed
jest.mock('../backend/business/Business', () => {
    return {
        Business: {
            calculatePrintCredits: jest.fn().mockReturnValue(10),
            maxTemplates: jest.fn().mockReturnValue(5),
            getQuotas: jest.fn().mockReturnValue({ prints: 10, templates: 5, pages: 10 }),
            primeUser: jest.fn(),
        }
    };
});

describe('UserTools', () => {
    let mockUserDao: any;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Setup UserDao mock instance
        mockUserDao = new UserDao();
        (UserDao as unknown as jest.Mock).mockImplementation(() => mockUserDao);
    });

    it('should include attribution data in the email when a new user is created with attribution', async () => {
        const attribution: AttributionData = {
            source: 'google',
            medium: 'cpc',
            campaign: 'summer_sale',
            term: 'shoes',
            content: 'banner_a',
            timestamp: 1234567890
        };

        const body = {
            source: 'test',
            token: 'test-token',
            attribution: attribution,
            testUser: new User(0, 'test-sha'), // Assuming test user logic in UserTools
        };

        // Setup test user
        const testUser = new User(0, 'test-sha');
        testUser.setSource('test');
        testUser.setEmail('test@example.com');
        body.testUser = testUser;

        // Mock DAO responses
        mockUserDao.getFromHash.mockResolvedValue(undefined); // User not found -> create new
        mockUserDao.save.mockResolvedValue({ ...testUser, id: 123 }); // Return saved user with ID

        await UserTools.authenticate(body, mockUserDao);

        expect(Email.send).toHaveBeenCalledTimes(1);
        const emailMessage = (Email.send as jest.Mock).mock.calls[0][0] as string;

        // Assertions for attribution data in email
        expect(emailMessage).toContain('Attribution:');
        expect(emailMessage).toContain('Source: google');
        expect(emailMessage).toContain('Medium: cpc');
        expect(emailMessage).toContain('Campaign: summer_sale');
        expect(emailMessage).toContain('Term: shoes');
        expect(emailMessage).toContain('Content: banner_a');
    });

    it('should NOT include attribution data in the email when attribution is missing', async () => {
        const body = {
            source: 'test',
            token: 'test-token',
            // No attribution
            testUser: new User(0, 'test-sha'),
        };

        // Setup test user
        const testUser = new User(0, 'test-sha');
        testUser.setSource('test');
        testUser.setEmail('test@example.com');
        body.testUser = testUser;

        // Mock DAO responses
        mockUserDao.getFromHash.mockResolvedValue(undefined); // User not found -> create new
        mockUserDao.save.mockResolvedValue({ ...testUser, id: 124 }); // Return saved user with ID

        await UserTools.authenticate(body, mockUserDao);

        expect(Email.send).toHaveBeenCalledTimes(1);
        const emailMessage = (Email.send as jest.Mock).mock.calls[0][0] as string;

        // Assertions for NO attribution data in email
        expect(emailMessage).not.toContain('Attribution:');
    });
});
