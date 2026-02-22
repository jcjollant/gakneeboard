import { describe, expect, test, jest, afterEach, beforeEach } from '@jest/globals';
import { VercelService } from '../backend/services/VercelService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VercelService', () => {

    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV, VERCEL_TOKEN: 'test_token' };
    });

    afterEach(() => {
        process.env = OLD_ENV;
        jest.restoreAllMocks();
    });

    describe('setEnvVar', () => {
        test('Update existing env var', async () => {
            const key = 'TEST_KEY';
            const value = 'new_value';
            const envId = 'env_123';

            // Mock list env vars
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    envs: [{ id: envId, key: key }]
                }
            });

            // Mock update env var
            mockedAxios.patch.mockResolvedValueOnce({ data: {} });

            await VercelService.setEnvVar(key, value);

            expect(mockedAxios.get).toHaveBeenCalled();
            expect(mockedAxios.patch).toHaveBeenCalledWith(
                expect.stringContaining(envId),
                expect.objectContaining({ value: value }),
                expect.any(Object)
            );
        });

        test('Create new env var', async () => {
            const key = 'NEW_KEY';
            const value = 'new_value';

            // Mock list env vars (empty)
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    envs: []
                }
            });

            // Mock create env var
            mockedAxios.post.mockResolvedValueOnce({ data: {} });

            await VercelService.setEnvVar(key, value);

            expect(mockedAxios.get).toHaveBeenCalled();
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/env'),
                expect.objectContaining({ key: key, value: value }),
                expect.any(Object)
            );
        });
    });

    describe('triggerRedeploy', () => {
        test('Trigger redeploy success', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: {} });

            await VercelService.triggerRedeploy();

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/deployments'),
                expect.objectContaining({ name: 'gak-server' }),
                expect.any(Object)
            );
        });
    });
});
