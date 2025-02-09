import 'dotenv/config'
import { UserDao } from './dao/UserDao'
import { SubscriptionDao } from './dao/SubscriptionDao'
import { AccountType } from './models/AccountType'
import { Subscription } from './models/Subscription'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const planUrl = '/plans'
// const pp1Price = 'price_1Qg0c7G89XrbqGAIJQAwl2HW'
const pp1Price = process.env.STRIPE_PP1_PRICE
const ip1Price = process.env.STRIPE_IP1_PRICE

export class Stripe {
    static async checkout(userHash:string, product:string, source:string):Promise<string> {
        console.log('[Stripe.checkout] user ' + userHash + ' product ' + product)
        const userId = await UserDao.getIdFromHash(userHash)
        return new Promise( async (resolve, reject) => {
            try {
                if(!userId) throw new Error('User Id is required');
                const priceId = Stripe.priceIdFromProduct(product)

                const successUrl = source.replace(planUrl,'/thankyou')
                const cancelUrl = source.replace(planUrl,'/')
                // const eventId = PaymentEventDao.create(userId, priceId)

                const session = await stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price : priceId, 
                            quantity: 1,
                        }
                    ],
                    mode: 'subscription',
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    allow_promotion_codes: true,
                    metadata: {
                        gakUserId: userId
                    }
                })
                resolve( session.url)
            } catch (err) {
                console.log('[Stripe.checkout] error ' + err)
                reject(err)
            }
        })
    }

    static async webhook(req:Request):Promise<void> {
        return new Promise(async (resolve, reject) => {
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
            const sig = req.headers['stripe-signature']
            let event;
            try {
                // console.log('[Stripe.webhook]', req.body)
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
                // console.log('[Stripe.webhook]', JSON.stringify(event))
            } catch (err) {
                console.log(`Webhook signature verification failed.`, err.message)
                reject()
            }
            // console.log('[Stripe.webhook] event', event.type)
            try {
                let customerId:string;
                let planId:string;
                let subscriptionId:string;
                switch (event.type) {
                    case 'checkout.session.completed':
                        console.log('[Stripe.webhook] event', event.type)
                        // console.log('[Stripe.webhook] checkout.session.completed', JSON.stringify(event))
                        // correlate Stripe customer and our user Id
                        const userId = event.data.object.metadata.gakUserId;
                        customerId = event.data.object.customer;
                        subscriptionId = event.data.object.subscription;
                        await SubscriptionDao.update(subscriptionId, customerId, undefined, userId).then( (sub)=>{
                            Stripe.updateUser(sub)
                        })
                        break;
                    case 'customer.subscription.created':
                        console.log('[Stripe.webhook] event', event.type)
                        subscriptionId = event.data.object.id;
                        customerId = event.data.object.customer;
                        planId = event.data.object.plan.id;
                        await SubscriptionDao.update(subscriptionId, customerId, planId, undefined).then( (sub)=>{
                            Stripe.updateUser(sub)
                        });
                        // console.log('[Stripe.webhook] customer.subscription.created', subscriptionId, customerId, planId)
                        break;
                    // case 'customer.subscription.updated':
                    //     subscriptionId = event.data.object.id;
                    //     customerId = event.data.object.customer;
                    //     planId = event.data.object.plan.id;
                    //     await SubscriptionDao.update(subscriptionId, customerId, planId, undefined).then( (sub)=>{
                    //         Stripe.updateUser(sub)
                    //     })
                    //     // console.log('[Stripe.webhook] customer.subscription.updated', subscriptionId, customerId, planId)
                    //     break
                    case 'customer.subscription.deleted':
                        console.log('[Stripe.webhook] event', event.type)
                        const customerSubscriptionDeleted = event.data.object
                        break
                    default:
                        // console.log(`Unhandled event type ${event.type}.`)
                }
            } catch(err) {
                console.log('[Stripe.webhook] error ' + err)
                // TODO record something for further investigation
                reject(err)
            }
            resolve()
        })
    }

    static accountTypeFromPrice(planId: string) {
        switch(planId) {
            case pp1Price: return AccountType.private;
            case ip1Price: return AccountType.instrument;
            default: return AccountType.unknown;
        }
    }
 
    static priceIdFromProduct(product:string):string {
        let price:string|undefined
        switch(product.toLowerCase()) {
            case 'pp1': price = pp1Price; break;
            case 'ip1': price = ip1Price; break;
            default: throw new Error('Product not found');
        }
        if(!price) throw new Error('Price not found');
        return price;
    }


    static async updateUser(subscription:Subscription):Promise<boolean> {
        if(!subscription.planId || !subscription.userId) {
            // console.log('[Stripe.updateUser] not ready for user update. Missing planId or userId')
            return false;
        }

        const accountType = Stripe.accountTypeFromPrice(subscription.planId)
        return UserDao.updateType(subscription.userId, accountType)
    }
}