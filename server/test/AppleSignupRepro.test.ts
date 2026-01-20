import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { UserTools } from '../backend/UserTools';
import { User } from '../backend/models/User';

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

// Mock Business
jest.mock('../backend/business/Business', () => {
    return {
        Business: {
            calculatePrintCredits: jest.fn().mockReturnValue(10),
            maxTemplates: jest.fn().mockReturnValue(5),
            getQuotas: jest.fn().mockReturnValue({ prints: 10, templates: 5, pages: 10 }),
            MAX_PAGES_SIMMER: 10,
            MAX_TEMPLATE_SIMMER: 5,
        }
    };
});

describe('Apple Signup Restriction', () => {
    let mockUserDao: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserDao = new UserDao();
        (UserDao as unknown as jest.Mock).mockImplementation(() => mockUserDao);
    });

    it('should REJECT signup with Apple private relay email', async () => {
        const appleEmail = 'test@privaterelay.appleid.com';

        // Use 'test' source to avoid JWT decoding complexity, 
        // effectively simulating the user object that would result from decodeApple
        // providing the logic in authenticate checks the user object properties.
        // Wait, authenticate calls decodeApple if source is apple. 
        // If I use 'test' source, I can inject a user with that email.
        // The check I plan to implement will likely be in `authenticate` after getting the user object,
        // so testing with 'test' source with that email should be valid if I implement the check on the user object.
        // HOWEVER, if I implement the check inside decodeApple, using 'test' source won't catch it.
        // BUT, the goal is to prevent signup.
        // Let's try to mock decodeApple if possible, or just use 'test' source and verify behavior.
        // Actually, if I modify `authenticate` to check `user.email`, then 'test' source is fine.
        // If I modify `decodeApple`, I should mock it.

        // Let's start by using 'test' source to simulate the condition where a user *has* that email.

        const testUser = new User(0, 'some-sha');
        testUser.setSource('apple'); // Pretend it came from apple
        testUser.setEmail(appleEmail);

        const body = {
            source: 'test', // cheating to inject the user object directly
            token: 'dummy',
            testUser: testUser
        };

        // Mock DAO to simulate new user
        mockUserDao.getFromHash.mockResolvedValue(undefined);
        mockUserDao.save.mockResolvedValue({ ...testUser, id: 123 });

        // Currently expecting this to succeed
        await expect(UserTools.authenticate(body, mockUserDao)).rejects.toThrow("Sign in with Apple is not allowed with 'Hide My Email'. Please share your real email address or use another sign in method.");
    });
});
