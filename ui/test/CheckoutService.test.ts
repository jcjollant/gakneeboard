import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { CheckoutService } from '../src/services/CheckoutService';
import { CurrentUser } from '../src/assets/CurrentUser';
import axios from 'axios';

import { AttributionService } from '../src/services/AttributionService';

jest.mock('axios');
jest.mock('../src/services/AttributionService', () => ({
    AttributionService: {
        getAttribution: jest.fn()
    }
}));

// Mock window location
Object.defineProperty(global, 'window', {
    value: {
        location: {
            href: 'http://localhost'
        }
    }
});

describe('CheckoutService', () => {
    const privatePilotPlan = 'pp2'

    describe('plan', () => {
        const mockUser = {
            sha256: 'mock_user_hash'
        } as CurrentUser;

        beforeEach(() => {
            jest.clearAllMocks();
            (AttributionService.getAttribution as jest.Mock).mockReturnValue(null);
        });

        test('should call checkout API and return URL', async () => {
            const expectedUrl = 'https://checkout.stripe.com/pay/cs_test_...';
            (axios.post as jest.Mock<any>).mockResolvedValue({ data: { url: expectedUrl } });

            const url = await CheckoutService.plan(privatePilotPlan, mockUser);

            expect(url).toBe(expectedUrl);
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('stripe/checkout'),
                expect.objectContaining({
                    user: 'mock_user_hash',
                    product: privatePilotPlan
                }),
                expect.anything()
            );
        });

        test('should include attribution data in the payload when available', async () => {
            const expectedUrl = 'https://checkout.stripe.com/pay/cs_test_...';
            (axios.post as jest.Mock<any>).mockResolvedValue({ data: { url: expectedUrl } });

            const mockAttribution = { source: 'google', medium: 'cpc', timestamp: 1234567890 };
            (AttributionService.getAttribution as jest.Mock).mockReturnValue(mockAttribution);

            await CheckoutService.plan(privatePilotPlan, mockUser);

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('stripe/checkout'),
                expect.objectContaining({
                    user: 'mock_user_hash',
                    product: privatePilotPlan,
                    attribution: mockAttribution
                }),
                expect.anything()
            );
        });

        test('should handle API error gracefully', async () => {
            (axios.post as jest.Mock<any>).mockRejectedValue(new Error('Network Error'));

            await expect(CheckoutService.plan(privatePilotPlan, mockUser)).rejects.toEqual('/');
        });
    });

    describe('manage', () => {
        const mockUser = {
            sha256: 'mock_user_hash'
        } as CurrentUser;

        test('should call plan with "manage"', async () => {
            const expectedUrl = 'https://billing.stripe.com/p/login/...';
            (axios.post as jest.Mock<any>).mockResolvedValue({ data: { url: expectedUrl } });

            const url = await CheckoutService.manage(mockUser);

            expect(url).toBe(expectedUrl);
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('stripe/checkout'),
                expect.objectContaining({
                    user: 'mock_user_hash',
                    product: 'manage'
                }),
                expect.anything()
            );
        });
    });
});
