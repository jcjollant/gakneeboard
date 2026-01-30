import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { Authorization } from '../backend/services/Authorization';
import { UserTools } from '../backend/UserTools';
import { GApiError } from '../backend/GApiError';
import { Request } from 'express';

describe('Authorization Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('validateAdmin should return userId for admin user', async () => {
        const req = {} as Request;
        const mockUserId = 1;
        jest.spyOn(UserTools, 'userIdFromRequest').mockResolvedValue(mockUserId);
        jest.spyOn(UserTools, 'isAdmin').mockReturnValue(true);

        const result = await Authorization.validateAdmin(req);
        expect(result).toBe(mockUserId);
        expect(UserTools.userIdFromRequest).toHaveBeenCalledWith(req);
        expect(UserTools.isAdmin).toHaveBeenCalledWith(mockUserId);
    });

    it('validateAdmin should throw 401 for non-admin user', async () => {
        const req = {} as Request;
        const mockUserId = 2;
        jest.spyOn(UserTools, 'userIdFromRequest').mockResolvedValue(mockUserId);
        jest.spyOn(UserTools, 'isAdmin').mockReturnValue(false);

        await expect(Authorization.validateAdmin(req)).rejects.toEqual(new GApiError(401, 'Unauthorized admin request 2'));
        expect(UserTools.userIdFromRequest).toHaveBeenCalledWith(req);
        expect(UserTools.isAdmin).toHaveBeenCalledWith(mockUserId);
    });

    it('validateAdmin should throw 401 when userId is missing', async () => {
        const req = {} as Request;
        jest.spyOn(UserTools, 'userIdFromRequest').mockResolvedValue(undefined);

        await expect(Authorization.validateAdmin(req)).rejects.toEqual(new GApiError(401, 'Unauthorized admin request undefined'));
        expect(UserTools.userIdFromRequest).toHaveBeenCalledWith(req);
        // UserTools.isAdmin should not be called if userId is undefined
    });
});
