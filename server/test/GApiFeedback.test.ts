
import { describe, expect, it, jest, afterEach, beforeEach } from '@jest/globals';
import { GApi } from '../backend/GApi';
import { Email, EmailType } from '../backend/Email';

// Mock Email
jest.mock('../backend/Email', () => {
    return {
        Email: {
            send: jest.fn(),
        },
        EmailType: {
            UserFeedback: 4,
        }
    };
});

// Mock FeedbackDao
jest.mock('../backend/FeedbackDao', () => {
    return {
        FeedbackDao: {
            save: jest.fn().mockImplementation(() => Promise.resolve()),
        }
    };
});

describe('GApi Feedback', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send email with EmailType.UserFeedback when saving feedback', async () => {
        const payload = {
            version: '1.0',
            feedback: 'Great app!',
            user: 'user-sha',
            contact: 'test@example.com'
        };

        await GApi.feedbackSave(payload);

        expect(Email.send).toHaveBeenCalledTimes(1);
        expect(Email.send).toHaveBeenCalledWith('Great app!', EmailType.UserFeedback);
    });
});
