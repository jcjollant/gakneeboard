import 'dotenv/config'
import { UserDao } from '../dao/UserDao'
import { SubscriptionDao } from '../dao/SubscriptionDao'
import { AccountType } from '@checklist/shared';
import { Stripe } from 'stripe'
import { Business } from './Business'
import { AttributionData } from '../models/AttributionData'

import { sql } from '@vercel/postgres'
import { Ticket } from '../Ticket'
import { Request } from "express"

const planUrl = '/plans'
const pp1Price = process.env.STRIPE_PP1_PRICE;
const pp2Price = process.env.STRIPE_PP2_PRICE;
const hh1Price = process.env.STRIPE_HH1_PRICE;
const bd1Price = process.env.STRIPE_BD1_PRICE;
const ld1Price = process.env.STRIPE_LD1_PRICE;
const ff1Price = 'free';
const SUB_UPDATE = 'customer.subscription.updated';
const SUB_DELETE = 'customer.subscription.deleted';
const CHECKOUT_COMPLETE = 'checkout.session.completed'

export class StripeClient {
    private static _instance: StripeClient;
    private stripe: Stripe | undefined = undefined;

    private constructor() {
        try {
            if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe secret key not found')
            this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        } catch (e) {
            console.log('Stripe initialization failed ' + e)
            this.stripe = undefined
        }
    }

    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    async checkout(userHash: string, product: string, source: string, attribution?: AttributionData): Promise<string> {
        // console.log('[Stripe.checkout] user ' + userHash + ' product ' + product)
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

                const price = this.priceFromProduct(product)
                const successUrl = source.replace(planUrl, '/thankyou')
                const cancelUrl = source.replace(planUrl, '/')
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

                const session = await this.stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price: price.id,
                            quantity: 1,
                        }
                    ],
                    customer: user.customerId,
                    mode: price.subscription ? 'subscription' : 'payment',
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    allow_promotion_codes: false,
                    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
                })
                // return url if it's not null
                if (!session.url) throw new Error('Session url is null')
                resolve(session.url)
            } catch (err) {
                Ticket.create(3, '[Stripe.checkout] error ' + err)
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
                // console.log('[Stripe.webhook]', req.body)
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
                        const accountType = this.accountTypeFromPrice(priceId)
                        await Business.subscriptionUpdate(subscriptionId, customerId, priceId, accountType, periodEnd, cancelAt, endedAt, userDao, subscriptionDao)
                    }
                    // save event for future reference
                    await sql`INSERT INTO stripe_events (type, stripe_id, data) VALUES (${event.type}, ${subscriptionId}, ${JSON.stringify(event.data.object)})`
                } else if (event.type == CHECKOUT_COMPLETE) {
                    // console.log('[Stripe.webhook]', JSON.stringify(event.data))
                    // Record event into stripe_events table
                    const stripeId = event.data.object.id;
                    await sql`INSERT INTO stripe_events (type, stripe_id, data) VALUES (${event.type}, ${stripeId}, ${JSON.stringify(event.data.object)})`
                    // console.log('[Stripe.webhook]', JSON.stringify(event.type), now)
                    if (!event.data.object.subscription) { // not a subscription
                        // console.log('[Stripe.webhook] non subscription checkout complete', event.data.object.id)
                        const sessionId = event.data.object.id;
                        const customerId = String(event.data.object.customer);
                        await this.stripe.checkout.sessions.listLineItems(sessionId).then(async (li) => {
                            const priceId = li.data[0].price?.id
                            console.log('[Stripe.webhook] priceId', priceId)
                            const userDao = new UserDao()
                            switch (priceId) {
                                case hh1Price:
                                    const printCount = Business.PRINT_PER_PURCHASE
                                    await Business.printPurchase(customerId, printCount, userDao).catch((err) => {
                                        Ticket.create(2, `Customer ${customerId}, Failed to purchase ${printCount} prints. Stripe ${stripeId}`)
                                    });
                                    break;
                                case ld1Price: // Lifetime Deal
                                    const user = await userDao.getFromCustomerId(customerId)
                                    await Business.upgradeUser(user, AccountType.lifetime, userDao);
                                    break;
                                default:
                                    console.log('[Stripe.webhook] unexpected priceId', priceId)
                            }
                        })
                    }
                }
            } catch (err) {
                Ticket.create(2, '[Stripe.webhook] ' + err)
                reject(err)
            }

            // console.log('[Stripe.webhook] resolve', now)
            resolve();
        })
    }

    accountTypeFromPrice(planId: string) {
        switch (planId) {
            case bd1Price: return AccountType.beta;
            case pp1Price: return AccountType.student;
            case pp2Price: return AccountType.private;
            case ff1Price: return AccountType.simmer;
            case ld1Price: return AccountType.lifetime;
            default: return AccountType.unknown;
        }
    }

    priceFromProduct(product: string): Price {
        // console.log('[Stripe.priceIdFromProduct]', product)
        let price: string | undefined
        switch (product.toLowerCase()) {
            case 'pp1': return new Price(pp1Price, true);
            case 'pp2': return new Price(pp2Price, true);
            case 'hh1': return new Price(hh1Price, false);
            case 'bd1': return new Price(bd1Price, true);
            case 'ld1': return new Price(ld1Price, false);
            default: throw new Error('Product not found : ' + product);
        }
    }
}

class Price {
    id: string;
    subscription: boolean;
    constructor(priceId: string | undefined, subscription: boolean) {
        if (!priceId) throw new Error('Price id missing');
        this.id = priceId;
        this.subscription = subscription;
    }
}