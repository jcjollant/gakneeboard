import 'dotenv/config'
import { UserDao } from '../dao/UserDao'
import { SubscriptionDao } from '../dao/SubscriptionDao'
import { AccountType } from '../models/AccountType'
import { Subscription } from '../models/Subscription'
import { Stripe } from 'stripe'
import e from 'express'

const planUrl = '/plans'
// const pp1Price = 'price_1Qg0c7G89XrbqGAIJQAwl2HW'
const pp1Price = process.env.STRIPE_PP1_PRICE;
const ip1Price = process.env.STRIPE_IP1_PRICE;
const ff1Price = 'free';
const SUB_UPDATE = 'customer.subscription.updated';
const SUB_DELETE = 'customer.subscription.deleted';

export class StripeClient {
    private static _instance: StripeClient;
    private stripe:Stripe|undefined=undefined;

    private constructor() {
        try {
            if(!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe secret key not found')
            this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        } catch(e) {
            console.log('Stripe initialization failed ' + e)
            this.stripe = undefined
        }
    }

    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    async checkout(userHash:string, product:string, source:string):Promise<string> {
        // console.log('[Stripe.checkout] user ' + userHash + ' product ' + product)
        return new Promise( async (resolve, reject) => {
            try {
                if(!this.stripe) throw new Error('Stripe not initialized');
                const user = await UserDao.getUserFromHash(userHash)
                if(!user) throw new Error('User not found ' + userHash);

                // does this user already have a customer id
                if(!user.customerId) {
                    // new customer, create a new customer_id
                    const customer = await this.stripe.customers.create({
                        name: user.name,
                        email: user.email
                    })
                    user.setCustomerId(customer.id)
                    // console.log('[Stripe.checkout] created customer ' + customer.id)
                    await UserDao.updateCustomerId(user)
                }

                const priceId = this.priceIdFromProduct(product)
                const successUrl = source.replace(planUrl,'/thankyou')
                const cancelUrl = source.replace(planUrl,'/')
                // const eventId = PaymentEventDao.create(userId, priceId)

                const session = await this.stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price : priceId, 
                            quantity: 1,
                        }
                    ],
                    customer: user.customerId,
                    mode: 'subscription',
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    allow_promotion_codes: true,
                })
                // return url if it's not null
                if(!session.url) throw new Error('Session url is null')
                resolve(session.url)
            } catch (err) {
                console.log('[Stripe.checkout] error ' + err)
                reject(err)
            }
        })
    }

    async manage(userHash:string, source:string):Promise<string> {
        // console.log('[Stripe.manage] user ' + userHash)
        return new Promise( async (resolve, reject) => {
            try {
                if(!this.stripe) throw new Error('Stripe not initialized');

                const user = await UserDao.getUserFromHash(userHash)
                if(!user) throw new Error('User Id is required');
                if(!user.customerId) throw new Error('Customer Id not found');
                const successUrl = source.replace(planUrl, '/')
                const session = await this.stripe.billingPortal.sessions.create({
                    customer: user.customerId,
                    return_url: successUrl
                })
                // return url if it's not null
                if(!session.url) throw new Error('Session url is null')
                resolve(session.url)
            } catch (err) {
                console.log('[Stripe.manage] error ' + err)
                reject(err)
            }
        })
    }

    async webhook(req:Request):Promise<void> {
        return new Promise(async (resolve, reject) => {
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
            const sig = req.headers['stripe-signature']
            let event:Stripe.Event;
            const now = new Date();
            try {
                if(!this.stripe) throw new Error('Stripe not initialized');
                if(!endpointSecret) throw new Error('Stripe webhook secret not found');
                if(!sig) throw new Error('Stripe signature not found');
                if(!req.body) throw new Error('Stripe request body not found');
                // console.log('[Stripe.webhook]', req.body)
                event = this.stripe.webhooks.constructEvent(String(req.body), sig, endpointSecret)
                console.log('[Stripe.webhook]', JSON.stringify(event.type), now)
 
                if(event.type == SUB_UPDATE || event.type == SUB_DELETE) {
                    const subscriptionId = event.data.object.id;
                    const customerId = String(event.data.object.customer);
                    const planId = event.data.object.plan.id;
                    const periodEnd = event.data.object.current_period_end;
                    const cancelAt = event.data.object.cancel_at;
                    const endedAt = event.data.object.ended_at
                    if(event.type == SUB_DELETE) {
                        await SubscriptionDao.updateEndedAt(subscriptionId,endedAt)
                    } else {
                        await SubscriptionDao.update(subscriptionId, customerId, planId, periodEnd, cancelAt)
                    }
                    await this.updateAccountType(customerId, planId, endedAt)
                }
            } catch(err) {
                console.log('[Stripe.webhook] ' + err)
                reject(err)
            }

            console.log('[Stripe.webhook] resolve', now)
            resolve();
        })
    }

    accountTypeFromPrice(planId: string) {
        switch(planId) {
            case pp1Price: return AccountType.private;
            case ip1Price: return AccountType.instrument;
            case ff1Price: return AccountType.simmer;
            default: return AccountType.unknown;
        }
    }
 
    priceIdFromProduct(product:string):string {
        let price:string|undefined
        switch(product.toLowerCase()) {
            case 'pp1': price = pp1Price; break;
            case 'ip1': price = ip1Price; break;
            case 'ff1': price = ff1Price; break;
            default: throw new Error('Product not found');
        }
        if(!price) throw new Error('Price not found');
        return price;
    }


    async updateAccountType(customerId:string,planId:string,endedAt:number|null):Promise<boolean> {
        if(!customerId) return false;

        // determine account type from end data and plan
        const newAccountType = endedAt ? AccountType.simmer : this.accountTypeFromPrice(planId);

        let success = false;
        await UserDao.getUserFromCustomerId(customerId).then( async (user) => {
            if(user.accountType != newAccountType) {
                await UserDao.updateType(user.id, newAccountType)
            }
            success = true
        }).catch( (err) => {
            console.log('[Stripe.updateAccountType] failed ' + err)
        })
        return success;
    }
}