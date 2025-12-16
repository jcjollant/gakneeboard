import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { CheckoutService, Pricing } from '../src/services/CheckoutService';
import { AccountType } from '../src/models/AccounType';
import { CurrentUser } from '../src/assets/CurrentUser';
import axios from 'axios';

jest.mock('axios');

// Mock window location
Object.defineProperty(global, 'window', {
    value: {
        location: {
            href: 'http://localhost'
        }
    }
});

describe('CheckoutService', () => {

    describe('accountTypeFromPricing', () => {
        test('should return correct AccountType for known pricing codes', () => {
            expect(CheckoutService.accountTypeFromPricing(Pricing.simmer)).toBe(AccountType.simmer);
            expect(CheckoutService.accountTypeFromPricing(Pricing.studentPilot)).toBe(AccountType.beta); // Note: studentPilot maps to beta in code
            expect(CheckoutService.accountTypeFromPricing(Pricing.privatePilot)).toBe(AccountType.beta);
            expect(CheckoutService.accountTypeFromPricing(Pricing.betaDeal)).toBe(AccountType.beta);
            expect(CheckoutService.accountTypeFromPricing(Pricing.hobbs)).toBe(AccountType.hobbs);
            expect(CheckoutService.accountTypeFromPricing(Pricing.lifetimeDeal)).toBe(AccountType.lifetime);
        });

        test('should return AccountType.unknown for invalid pricing code', () => {
            expect(CheckoutService.accountTypeFromPricing('INVALID_CODE' as any)).toBe(AccountType.unknown);
        });
    });

    describe('plan', () => {
        const mockUser = {
            sha256: 'mock_user_hash'
        } as CurrentUser;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should call checkout API and return URL', async () => {
            const expectedUrl = 'https://checkout.stripe.com/pay/cs_test_...';
            (axios.post as jest.Mock).mockResolvedValue({ data: { url: expectedUrl } });

            const url = await CheckoutService.plan(Pricing.privatePilot, mockUser);

            expect(url).toBe(expectedUrl);
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('stripe/checkout'),
                expect.objectContaining({
                    user: 'mock_user_hash',
                    product: Pricing.privatePilot
                }),
                expect.anything()
            );
        });

        test('should handle API error gracefully', async () => {
            (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

            await expect(CheckoutService.plan(Pricing.privatePilot, mockUser)).rejects.toEqual('/');
        });
    });

    describe('manage', () => {
        const mockUser = {
            sha256: 'mock_user_hash'
        } as CurrentUser;

        test('should call plan with "manage"', async () => {
            const expectedUrl = 'https://billing.stripe.com/p/login/...';
            (axios.post as jest.Mock).mockResolvedValue({ data: { url: expectedUrl } });

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
