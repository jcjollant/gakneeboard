import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';

// Set up environment variables
// Note: 'dotenv/config' in the module might override these if we don't handle it.
// However, in Jest, we can overwrite them.
// The issue is that the module is imported AND executes dotenv/config which reads .env
// We should overwrite them immediately after import or mock dotenv.
// Actually, easier way: just assert against the values that ARE loaded if we want to test logic. 
// But simpler: overwrite process.env properties forcefully.

process.env.STRIPE_SECRET_KEY = 'mock_key';
process.env.STRIPE_PP1_PRICE = 'price_1QqiSCG89XrbqGAIuHSrFEOT';
process.env.STRIPE_PP2_PRICE = 'price_1RtYk6G89XrbqGAIRdgdHEkd';
process.env.STRIPE_HH1_PRICE = 'price_1QyFNWG89XrbqGAI2oQFv629';
process.env.STRIPE_BD1_PRICE = 'price_1QzroGG89XrbqGAIUhzCrr5F';
process.env.STRIPE_LD1_PRICE = 'price_1SRl2PG89XrbqGAIJSHioW7g';

import { StripeClient, Price } from '../backend/business/Stripe';
import { AccountType } from '@checklist/shared';

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
            expect(price.id).toBe(process.env.STRIPE_PP1_PRICE);
            expect(price.subscription).toBe(true);
        });

        it('should return correct price for PP2 (Private Pilot)', () => {
            const price = stripe.priceFromProduct('pp2');
            expect(price.id).toBe(process.env.STRIPE_PP2_PRICE);
            expect(price.subscription).toBe(true);
        });

        it('should return correct price for LD1 (Lifetime Deal)', () => {
            const price = stripe.priceFromProduct('ld1');
            expect(price.id).toBe(process.env.STRIPE_LD1_PRICE);
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
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_PP1_PRICE!)).toBe(AccountType.student);
        });

        it('should return AccountType.private for PP2 price', () => {
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_PP2_PRICE!)).toBe(AccountType.private);
        });

        it('should return AccountType.beta for BD1 price', () => {
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_BD1_PRICE!)).toBe(AccountType.beta);
        });

        it('should return AccountType.lifetime for LD1 price', () => {
            expect(stripe.accountTypeFromPrice(process.env.STRIPE_LD1_PRICE!)).toBe(AccountType.lifetime);
        });

        it('should return AccountType.unknown for unknown price', () => {
            expect(stripe.accountTypeFromPrice('unknown_price')).toBe(AccountType.unknown);
        });
    });
});
