
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../api/index';
import { StripeClient } from '../../backend/business/Stripe';
import { AttributionData } from '../../backend/models/AttributionData';
import { UserTools } from '../../backend/UserTools';

// Mock dependencies
jest.mock('../../backend/business/Stripe', () => {
    return {
        StripeClient: {
            instance: {
                checkout: jest.fn(),
                manage: jest.fn(),
                webhook: jest.fn()
            }
        }
    };
});

jest.mock('../../backend/UserTools', () => {
    return {
        UserTools: {
            userIdFromRequest: jest.fn(),
            userShaFromRequest: jest.fn()
        }
    };
});

describe('Stripe Checkout API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (UserTools.userIdFromRequest as any).mockResolvedValue(1); // Default to admin user for tests
    });

    it('should pass attribution data to StripeClient.checkout', async () => {
        const mockUrl = 'https://checkout.stripe.com/session_id';
        (StripeClient.instance.checkout as jest.Mock<(...args: any[]) => Promise<string>>).mockResolvedValue(mockUrl);

        const payload = {
            user: 'userHash123',
            product: 'pp1',
            source: 'http://localhost:3000/plans',
            attribution: {
                source: 'google',
                medium: 'cpc',
                campaign: 'spring_sale',
                term: 'flight planning',
                content: 'banner_a',
                timestamp: 1234567890
            } as AttributionData
        };

        const res = await request(app)
            .post('/stripe/checkout')
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body.url).toBe(mockUrl);
        expect(StripeClient.instance.checkout).toHaveBeenCalledWith(
            payload.user,
            payload.product,
            'plan',
            payload.source,
            expect.objectContaining(payload.attribution as unknown as Record<string, unknown>),
            undefined
        );
    });

    it('should handle missing attribution data gracefully', async () => {
        const mockUrl = 'https://checkout.stripe.com/session_id';
        (StripeClient.instance.checkout as jest.Mock<(...args: any[]) => Promise<string>>).mockResolvedValue(mockUrl);

        const payload = {
            user: 'userHash123',
            product: 'pp1',
            source: 'http://localhost:3000/plans',
            // No attribution
        };

        const res = await request(app)
            .post('/stripe/checkout')
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body.url).toBe(mockUrl);
        expect(StripeClient.instance.checkout).toHaveBeenCalledWith(
            payload.user,
            payload.product,
            'plan',
            payload.source,
            undefined,
            undefined
        );
    });

    it('should return 401 if user is not authenticated', async () => {
        (UserTools.userIdFromRequest as any).mockResolvedValue(undefined);

        const payload = {
            user: 'unknownUser',
            product: 'pp1',
            source: 'http://localhost:3000/plans',
        };

        const res = await request(app)
            .post('/stripe/checkout')
            .send(payload);

        expect(res.status).toBe(401);
        expect(res.text).toBe('Please sign in to continue');
        expect(StripeClient.instance.checkout).not.toHaveBeenCalled();
    });
});
