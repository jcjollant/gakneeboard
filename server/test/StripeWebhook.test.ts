
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { StripeClient } from '../backend/business/Stripe';
import { Business } from '../backend/business/Business';
import { UserDao } from '../backend/dao/UserDao';
import { AccountType } from '@checklist/shared';
// Import JSON data
// We'll use require because importing JSON directly might require configuration
const lineItems = require('./jsonData/checkout-session-ld-line-items.json');

// Mock dependencies
jest.mock('../backend/business/Business');
jest.mock('../backend/dao/UserDao');
jest.mock('../backend/dao/SubscriptionDao');
jest.mock('../backend/services/TicketService');
jest.mock('@vercel/postgres', () => ({
    sql: jest.fn(() => Promise.resolve({ rows: [], rowCount: 0 }))
}));

// Mock Email to prevent sending emails
jest.mock('../backend/Email', () => {
    const original = jest.requireActual('../backend/Email') as any;
    return {
        ...original,
        Email: {
            send: (jest.fn() as any).mockResolvedValue(true)
        }
    };
});

// Mock PlanService to return a lifetime plan for the price in the JSON
jest.mock('../backend/services/PlanService', () => {
    const { AccountType } = require('@checklist/shared');
    return {
        PlanService: {
            getPlanByPriceId: jest.fn((priceId) => {
                // The price ID in checkout-session-ld-line-items.json is "price_1SrVReG89XrbqGAI9MYEOZAh"
                if (priceId === 'price_1SrVReG89XrbqGAI9MYEOZAh') {
                    return {
                        id: 'ld1',
                        accountType: AccountType.lifetime
                    };
                }
                return undefined;
            }),
            getPlan: jest.fn()
        }
    }
});

// Mock Stripe
jest.mock('stripe', () => {
    const checkout_session = require('./jsonData/checkout-session-ld.json');

    // Define mocks inside the factory
    const mockListLineItems = jest.fn();
    const mockConstructEvent = jest.fn().mockReturnValue({
        type: 'checkout.session.completed', // CHECKOUT_COMPLETE
        data: {
            object: checkout_session
        }
    });

    const mockStripeConstructor = jest.fn().mockImplementation(() => {
        return {
            webhooks: {
                constructEvent: mockConstructEvent
            },
            checkout: {
                sessions: {
                    listLineItems: mockListLineItems
                }
            }
        };
    });

    // Attach mocks to the constructor so we can access them in the test
    (mockStripeConstructor as any).mockListLineItems = mockListLineItems;
    (mockStripeConstructor as any).mockConstructEvent = mockConstructEvent;

    return mockStripeConstructor;
});

import Stripe from 'stripe';

describe('StripeWebhook', () => {
    let mockListLineItems: any;

    beforeEach(() => {
        // Retrieve the mock function from the mocked module
        mockListLineItems = (Stripe as any).mockListLineItems;
        jest.clearAllMocks(); // Clear history

        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
        process.env.STRIPE_SECRET_KEY = 'sk_test_key';

        // Setup default mocks
        mockListLineItems.mockResolvedValue({ data: lineItems });

        // Mock UserDao to return a user instance with getFromCustomerId method
        (UserDao as unknown as jest.Mock).mockImplementation(() => ({
            getFromCustomerId: (jest.fn() as any).mockResolvedValue({
                id: 123,
                email: 'user@domain.tld',
                customerId: 'cus_TtsJn2A180rOIo',
            } as any)
        }));

        // Mock Business.upgradeUser
        (Business.upgradeUser as any).mockResolvedValue(undefined);
    });

    it('should process checkout.session.completed for Lifetime Deal and upgrade user', async () => {
        const req = {
            headers: {
                'stripe-signature': 'test_signature'
            },
            body: 'raw_body_content' // The content doesn't matter as we mock constructEvent
        } as any;

        await StripeClient.instance.webhook(req);

        // Verify existing mocks were called
        // Note: constructEvent is mocked inside the factory, we can verify it if we exposed it, 
        // or implicitly assume it worked because the code proceeded.

        // Verify listLineItems was called with correct session ID from JSON
        expect(mockListLineItems).toHaveBeenCalledWith('cs_live_a1AJ3UkcJKjXIFlRIm3r7yhLTVcPN9yFoEXGbUdEW1bNj6sRtCxEg3NZsp');

        // Verify Business.upgradeUser was called
        expect(Business.upgradeUser).toHaveBeenCalledWith(
            'cus_TtsJn2A180rOIo',
            AccountType.lifetime,
            'ld1',
            expect.any(Object) // The UserDao instance passed
        );
    });

    it('should process checkout.session.completed for Product Purchase', async () => {
        // Override constructEvent for this test
        const mockConstructEvent = (Stripe as any).mockConstructEvent;
        mockConstructEvent.mockReturnValue({
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'sess_123',
                    customer: 'cus_TtsJn2A180rOIo',
                    metadata: {
                        type: 'product',
                        productId: 'ref-card-lam'
                    },
                    customer_details: {
                        email: 'test@example.com',
                        name: 'Test User'
                    },
                    shipping_details: {
                        name: 'Test User',
                        address: {
                            line1: '123 Test St',
                            city: 'Test City',
                            state: 'TS',
                            postal_code: '12345',
                            country: 'US'
                        }
                    }
                }
            }
        });

        // Mock Business.createProductPurchase
        (Business.createProductPurchase as any).mockResolvedValue(undefined);

        const req = {
            headers: {
                'stripe-signature': 'test_signature'
            },
            body: 'raw_body_content'
        } as any;

        await StripeClient.instance.webhook(req);

        expect(Business.createProductPurchase).toHaveBeenCalledWith(
            'cus_TtsJn2A180rOIo',
            'ref-card-lam',
            expect.objectContaining({ email: 'test@example.com' }),
            expect.objectContaining({ name: 'Test User' }) // checking shipping name
        );
    });
});
