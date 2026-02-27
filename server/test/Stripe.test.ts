import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';

// Set up environment variables
// Note: 'dotenv/config' in the module might override these if we don't handle it.
// However, in Jest, we can overwrite them.
// The issue is that the module is imported AND executes dotenv/config which reads .env
// We should overwrite them immediately after import or mock dotenv.
// Actually, easier way: just assert against the values that ARE loaded if we want to test logic. 
// But simpler: overwrite process.env properties forcefully.

process.env.STRIPE_SECRET_KEY = 'mock_key';
process.env.STRIPE_PRICE_SP1 = 'price_1QqiSCG89XrbqGAIuHSrFEOT';
process.env.STRIPE_PRICE_PP3 = 'price_1SRwC1G89XrbqGAItxkMp2dq';
process.env.STRIPE_PRICE_CR1 = 'price_1T3jivG89XrbqGAI0Z3VdqcH';
process.env.STRIPE_PRICE_LD1 = 'price_1SRl2PG89XrbqGAIJSHioW7g';
process.env.STRIPE_PRICE_BD1 = 'price_1QzroGG89XrbqGAIUhzCrr5F';
import { StripeClient, Price } from '../backend/business/Stripe';
import { AccountType } from '@gak/shared';

describe('StripeClient', () => {
    describe('isSubscription', () => {
        it('should return true for monthly', () => {
            expect(StripeClient.isSubscription('monthly')).toBe(true);
        });

        it('should return true for yearly', () => {
            expect(StripeClient.isSubscription('yearly')).toBe(true);
        });

        it('should return false for never', () => {
            expect(StripeClient.isSubscription('never')).toBe(false);
        });

        it('should return false for onetime', () => {
            expect(StripeClient.isSubscription('onetime')).toBe(false);
        });
    });

    describe('priceFromProduct', () => {
        const stripe = StripeClient.instance;

        it('should return correct price for PP1 (Student Pilot)', () => {
            const price = stripe.priceFromProduct('pp1');
            expect(price.id).toBe(process.env.STRIPE_PRICE_SP1);
            expect(price.subscription).toBe(true);
        });

        it('should return correct price for PP3 (Private Pilot)', () => {
            const price = stripe.priceFromProduct('pp3');
            expect(price.id).toBe(process.env.STRIPE_PRICE_PP3);
            expect(price.subscription).toBe(true);
        });

        it('should return correct price for CR1 (Checkride)', () => {
            const price = stripe.priceFromProduct('cr1');
            expect(price.id).toBe(process.env.STRIPE_PRICE_CR1);
            expect(price.subscription).toBe(true);
        });

        it('should return correct price for LD1 (Lifetime Deal)', () => {
            const price = stripe.priceFromProduct('ld1');
            expect(price.id).toBe(process.env.STRIPE_PRICE_LD1);
            expect(price.subscription).toBe(false);
        });

        it('should throw error for unknown product', () => {
            expect(() => {
                stripe.priceFromProduct('unknown_product');
            }).toThrow('Product not found : unknown_product');
        });

        it('should throw error for valid products missing directly in PLANS if any', () => {
            expect(() => {
                stripe.priceFromProduct('someRandomProduct');
            }).toThrow('Product not found : someRandomProduct');
        });
    });

    describe('accountTypeFromPrice', () => {
        const stripe = StripeClient.instance;

        it('should return AccountType.student for PP1 price', () => {
            // TS detects mapping from env var
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_PRICE_SP1!)).toBe(AccountType.student);
        });

        it('should return AccountType.private for PP3 price', () => {
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_PRICE_PP3!)).toBe(AccountType.private);
        });

        it('should return AccountType.beta for BD1 price', () => {
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_PRICE_BD1!)).toBe(AccountType.beta);
        });

        it('should return AccountType.lifetime for LD1 price', () => {
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_PRICE_LD1!)).toBe(AccountType.lifetime);
        });

        it('should return AccountType.unknown for unknown price', () => {
            expect(stripe.accountTypeFromPrice('unknown_price')).toBe(AccountType.unknown);
        });
    });

    describe('planIdFromPrice', () => {
        const stripe = StripeClient.instance;

        it('should return "pp1" for PP1 price', () => {
            expect(stripe.planIdFromPrice(process.env.STRIPE_PRICE_SP1!)).toBe('pp1');
        });

        it('should return "pp3" for PP3 price', () => {
            expect(stripe.planIdFromPrice(process.env.STRIPE_PRICE_PP3!)).toBe('pp3');
        });

        it('should return "bd1" for BD1 price', () => {
            expect(stripe.planIdFromPrice(process.env.STRIPE_PRICE_BD1!)).toBe('bd1');
        });

        it('should return "ld1" for LD1 price', () => {
            expect(stripe.planIdFromPrice(process.env.STRIPE_PRICE_LD1!)).toBe('ld1');
        });

        it('should return undefined for unknown price', () => {
            expect(stripe.planIdFromPrice('unknown_price')).toBeUndefined();
        });
    });
    describe('checkout', () => {
        const stripe = StripeClient.instance;
        // We need to mock the internal stripe instance or the method call
        // Since stripe is private, we can't easily mock it without casting to any
        // But the Stripe constructor is likely mocked or we can mock it.
        // Given the file structure, we might need to rely on mocking the Stripe library if it's not already.

        // However, the previous tests didn't mock Stripe library for static methods, but checkout uses existing instance.
        // Let's create a partial mock of the StripeClient to avoid full Stripe library mocking complexity if possible,
        // OR better, mock the 'stripe' property of the instance.

        it('should generate correct success and cancel URLs', async () => {
            // Mock UserDao
            const UserDao = require('../backend/dao/UserDao').UserDao;
            jest.spyOn(UserDao, 'getUserFromHash').mockResolvedValue({
                customerId: 'cus_123',
                setCustomerId: jest.fn()
            });

            // Mock Stripe instance methods
            const mockCreateSession = jest.fn<any>().mockResolvedValue({ url: 'http://stripe.url' });
            (stripe as any).stripe = {
                customers: { create: jest.fn() },
                checkout: { sessions: { create: mockCreateSession } }
            };

            const source = 'https://example.com/some/path';
            const result = await stripe.checkout('userHash', 'pp1', 'plan', source);

            expect(result).toBe('http://stripe.url');
            expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
                success_url: 'https://example.com/thankyou?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'https://example.com/some/path'
            }));
        });
    });
});
