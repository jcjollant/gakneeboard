import 'dotenv/config'
import { UserDao } from '../dao/UserDao'
import { SubscriptionDao } from '../dao/SubscriptionDao'
import { AccountType, PlanDescription, PLANS, PRODUCTS, Product } from '@checklist/shared';
import Stripe from 'stripe'
import { Business } from './Business'
import { AttributionData } from '../models/AttributionData'

import { sql } from '@vercel/postgres'
import { TicketService } from "../services/TicketService";
import { Request } from "express"
import { PlanService } from '../services/PlanService';

const planUrl = '/plans'
const SUB_UPDATE = 'customer.subscription.updated';
const SUB_DELETE = 'customer.subscription.deleted';
const CHECKOUT_COMPLETE = 'checkout.session.completed'

export class StripeClient {
    private static _instance: StripeClient;
    private stripe: Stripe | undefined = undefined;

    private constructor(key: string) {
        try {
            this.stripe = new Stripe(key)
        } catch (e) {
            console.log('Stripe initialization failed ' + e)
            this.stripe = undefined
        }
    }

    public static get instance() {
        return this._instance || (this._instance = new this(process.env.STRIPE_SECRET_KEY));
    }

    public static get instanceProd() {
        return this._instance || (this._instance = new this(process.env.STRIPE_SECRET_KEY_PROD));
    }

    async checkout(userHash: string, itemId: string, type: 'plan' | 'product', source: string, attribution?: AttributionData, couponId?: string): Promise<string> {
        // console.log('[Stripe.checkout] user ' + userHash + ' item ' + itemId + ' type ' + type)
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.stripe) throw new Error('Stripe not initialized');
                const user = await UserDao.getUserFromHash(userHash)
                if (!user) throw new Error('User not found ' + userHash);

                // does this user already have a customer id
                if (!user.customerId) {
                    // new customer, create a new customer_id
                    const customer = await this.stripe.customers.create({
                        name: user.name,
                        email: user.email
                    })
                    user.setCustomerId(customer.id)
                    // console.log('[Stripe.checkout] created customer ' + customer.id)
                    await UserDao.updateCustomerId(user)
                }

                let priceId: string;
                let mode: Stripe.Checkout.SessionCreateParams.Mode = 'payment';
                let shipping_address_collection: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection | undefined = undefined;

                if (type === 'plan') {
                    const price = this.priceFromProduct(itemId)
                    priceId = price.id
                    mode = price.subscription ? 'subscription' : 'payment'
                } else if (type === 'product') {
                    const product = PRODUCTS.find(p => p.id === itemId);
                    if (!product) throw new Error('Product not found: ' + itemId);
                    const envPriceId = process.env[product.priceIdEnvVar];
                    if (!envPriceId) throw new Error('Price ID missing for product ' + itemId);
                    priceId = envPriceId;
                    shipping_address_collection = { allowed_countries: ['US', 'CA'] };
                } else {
                    throw new Error('Invalid checkout type: ' + type);
                }
                const origin = new URL(source).origin
                const successUrl = `${origin}/thankyou`
                const cancelUrl = source
                // const eventId = PaymentEventDao.create(userId, priceId)

                // Prepare metadata from attribution
                const metadata: Record<string, string> = {};
                if (attribution) {
                    if (attribution.source) metadata.utm_source = attribution.source;
                    if (attribution.medium) metadata.utm_medium = attribution.medium;
                    if (attribution.campaign) metadata.utm_campaign = attribution.campaign;
                    if (attribution.term) metadata.utm_term = attribution.term;
                    if (attribution.content) metadata.utm_content = attribution.content;
                    if (attribution.timestamp) metadata.utm_timestamp = String(attribution.timestamp);
                }
                if (type === 'product') {
                    metadata.type = 'product';
                    metadata.productId = itemId;
                }

                const sessionParams: Stripe.Checkout.SessionCreateParams = {
                    line_items: [
                        {
                            price: priceId,
                            quantity: 1,
                        }
                    ],
                    customer: user.customerId,
                    mode: mode,
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
                };

                if (shipping_address_collection) {
                    sessionParams.shipping_address_collection = shipping_address_collection;
                }

                if (couponId) {
                    sessionParams.discounts = [{ coupon: couponId }];
                } else {
                    sessionParams.allow_promotion_codes = true; // Allow if no specific coupon applied
                }

                const session = await this.stripe.checkout.sessions.create(sessionParams)
                // return url if it's not null
                if (!session.url) throw new Error('Session url is null')
                resolve(session.url)
            } catch (err) {
                TicketService.create(3, '[Stripe.checkout] error ' + err)
                console.error('[Stripe.checkout] error ' + err)
                reject(err)
            }
        })
    }

    async getLineItems(sessionId: string): Promise<Stripe.LineItem[]> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.stripe) throw new Error('Stripe not initialized');
                const session = await this.stripe.checkout.sessions.listLineItems(sessionId);
                resolve(session.data);
            } catch (err) {
                console.warn('[Stripe.getSession] error ' + err)
                reject(err)
            }
        })

    }

    async manage(userHash: string, source: string): Promise<string> {
        // console.log('[Stripe.manage] user ' + userHash)
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.stripe) throw new Error('Stripe not initialized');

                const user = await UserDao.getUserFromHash(userHash)
                if (!user) throw new Error('User Id is required');
                if (!user.customerId) throw new Error('Customer Id not found');
                const successUrl = source.replace(planUrl, '/')
                const session = await this.stripe.billingPortal.sessions.create({
                    customer: user.customerId,
                    return_url: successUrl
                })
                // return url if it's not null
                if (!session.url) throw new Error('Session url is null')
                resolve(session.url)
            } catch (err) {
                console.warn('[Stripe.manage] error ' + err)
                reject(err)
            }
        })
    }

    async webhook(req: Request): Promise<void> {
        // console.debug('[Stripe.webhook] ' + req.body)
        return new Promise(async (resolve, reject) => {
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
            const sig = req.headers['stripe-signature']
            let event: Stripe.Event;
            const now = new Date();
            try {
                if (!this.stripe) throw new Error('Stripe not initialized');
                if (!endpointSecret) throw new Error('Stripe webhook secret not found');
                if (!sig) throw new Error('Stripe signature not found');
                if (!req.body) throw new Error('Stripe request body not found');
                event = this.stripe.webhooks.constructEvent(String(req.body), sig, endpointSecret)
                // console.log('[Stripe.webhook]', JSON.stringify(event.type), now)

                if (event.type == SUB_UPDATE || event.type == SUB_DELETE) {
                    const subscriptionId = event.data.object.id;
                    const customerId = String(event.data.object.customer);
                    const priceId = event.data.object.items.data[0].plan.id;
                    const periodEnd = event.data.object.current_period_end;
                    const cancelAt = event.data.object.cancel_at;
                    const endedAt = event.data.object.ended_at
                    const userDao = new UserDao()
                    if (event.type == SUB_DELETE) {
                        await Business.subscriptionStop(subscriptionId, customerId, userDao, cancelAt, endedAt)
                    } else {
                        const subscriptionDao = new SubscriptionDao()
                        const plan = PlanService.getPlanByPriceId(priceId);
                        if (!plan) throw new Error('Plan not found for price ' + priceId)
                        await Business.subscriptionUpdate(subscriptionId, customerId, priceId, plan, periodEnd, cancelAt, endedAt, userDao, subscriptionDao)
                    }
                    // save event for future reference
                    await sql`INSERT INTO stripe_events (type, stripe_id, data) VALUES (${event.type}, ${subscriptionId}, ${JSON.stringify(event.data.object)})`
                } else if (event.type == CHECKOUT_COMPLETE) {
                    // console.log('[Stripe.webhook]', JSON.stringify(event.data))
                    // Record event into stripe_events table
                    const stripeId = event.data.object.id;
                    await sql`INSERT INTO stripe_events (type, stripe_id, data) VALUES (${event.type}, ${stripeId}, ${JSON.stringify(event.data.object)})`

                    const session = event.data.object as Stripe.Checkout.Session;

                    // Check if it is a product purchase
                    if (session.metadata?.type === 'product') {
                        const customerId = String(event.data.object.customer);
                        const productId = session.metadata.productId;
                        const customerDetails = session.customer_details;
                        const shippingDetails = session.shipping_details;
                        await Business.createProductPurchase(customerId, productId, customerDetails, shippingDetails);

                        return resolve();
                    }

                    if (!event.data.object.subscription) { // not a subscription
                        // console.log('[Stripe.webhook] non subscription checkout complete', event.data.object.id)
                        const sessionId = event.data.object.id;
                        const customerId = String(event.data.object.customer);
                        await this.stripe.checkout.sessions.listLineItems(sessionId).then(async (li) => {
                            // Defensive coding: handle price as object (with .id) or as string ID directly
                            const firstItem = li.data[0];
                            let priceId: string | undefined = undefined;

                            if (firstItem && firstItem.price) {
                                if (typeof firstItem.price === 'string') {
                                    priceId = firstItem.price;
                                } else if (typeof firstItem.price === 'object' && 'id' in firstItem.price) {
                                    priceId = firstItem.price.id;
                                }
                            }

                            // console.debug('[Stripe.webhook] listLineItems result', JSON.stringify(li.data))
                            // console.debug('[Stripe.webhook] resolved priceId', priceId)

                            if (!priceId) {
                                TicketService.create(2, '[Stripe.webhook] Could not resolve priceId for customer ' + customerId);
                                return;
                            }

                            const accountType = this.accountTypeFromPrice(priceId)
                            const planId = this.planIdFromPrice(priceId)
                            // console.debug('[Stripe.webhook] accountType:', accountType, 'planId:', planId)

                            if (accountType == AccountType.lifetime && planId) {
                                const userDao = new UserDao()
                                const user = await userDao.getFromCustomerId(customerId)
                                await Business.upgradeUser(user, AccountType.lifetime, planId, userDao);
                            } else {
                                TicketService.create(2, `[Stripe.webhook] Cannot resolve account type or plan for customer ${customerId} - AccountType: ${accountType}, PlanId: ${planId}`);
                            }
                        })
                    }

                } else {
                    const stripeId = (event.data.object as any).id;
                    await sql`INSERT INTO stripe_events (type, stripe_id) VALUES (${event.type}, ${stripeId})`
                    // console.debug('[Stripe.webhook] Unhandled event type: ' + event.type)
                }
            } catch (err) {
                await TicketService.create(2, '[Stripe.webhook] ' + err)
                reject(err)
            }

            // console.log('[Stripe.webhook] resolve', now)
            resolve();
        })
    }

    accountTypeFromPrice(priceId: string): AccountType {
        const plan = PlanService.getPlanByPriceId(priceId);
        return plan?.accountType || AccountType.unknown;
    }

    planIdFromPrice(priceId: string): string | undefined {
        const plan = PlanService.getPlanByPriceId(priceId);
        return plan?.id
    }

    priceFromProduct(product: string): Price {
        // console.log('[Stripe.priceIdFromProduct]', product)
        // find this plan id in PLANS
        const plan = PlanService.getPlan(product);
        if (!plan) throw new Error('Product not found : ' + product);
        return new Price(plan);
    }

    static isSubscription(chargeFrequency: string): boolean {
        return chargeFrequency === 'monthly' || chargeFrequency === 'yearly';
    }
}

export class Price {
    id: string;
    subscription: boolean;
    constructor(plan: PlanDescription) {
        // resolve price from environment variable
        const priceId = process.env[plan.priceEnvironmentVariable];
        if (!priceId) throw new Error('Price id missing for plan ' + plan.id);
        this.id = priceId;
        this.subscription = StripeClient.isSubscription(plan.chargeFrequency);
    }

}