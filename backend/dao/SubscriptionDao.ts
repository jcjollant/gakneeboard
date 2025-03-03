import { sql } from "@vercel/postgres"
import { Subscription } from "../models/Subscription"
import { Dao } from "./Dao";

export class SubscriptionDao extends Dao<Subscription> {
    protected tableName: string = 'subscriptions';

    /**
     * Create a new subscription record
     * @param subscriptionId 
     * @param customerId 
     * @param planId 
     * @param periodEnd End of the current billing period
     * @returns The corresponding subscription
     */
    public static async update(subscriptionId:string, customerId:string, planId:string, periodEnd:number, cancelAt:number|null, endedAt:number|null):Promise<Subscription> {
        // console.log('[SubsriptionDao.update] subscriptionId', subscriptionId, 'customerId', customerId, 'planId', planId, 'userId', userId)
        return new Promise<Subscription>(async (resolve, reject) => {
            // console.log('[SubsriptionDao.update] matches', result.rowCount)
            let sub:Subscription = new Subscription(subscriptionId, customerId, planId, periodEnd);
            const result = await sql`SELECT id FROM subscriptions WHERE id=${subscriptionId}`
            if(result.rowCount == 0) {
                await sql`INSERT INTO subscriptions (id, customer_id, plan_id, period_end, cancel_at, ended_at) VALUES (${subscriptionId},${customerId},${planId},${periodEnd}, ${cancelAt}, ${endedAt})`
                // console.log('[SubscriptionDao.create] created new subscription ')
            } else {
                await sql `UPDATE subscriptions SET customer_id=${customerId}, plan_id=${planId}, period_end=${periodEnd}, cancel_at=${cancelAt}, ended_at=${endedAt} WHERE id=${subscriptionId}`
                // console.log('[SubscriptionDao.create] updated subscription ' + subscriptionId)
            }

            resolve(sub)
        })
    }

    // public async updateEndedAt(subscriptionId:string, endedAt:number|null):Promise<Subscription> {
    //     return new Promise<Subscription>(async (resolve, reject) => {
    //         try {
    //             const result = await sql`SELECT * FROM subscriptions WHERE id=${subscriptionId}`
    //             if(result.rowCount == 0) {
    //                 reject('Subscription not found')
    //             }
    //             await sql`UPDATE subscriptions SET ended_at=${endedAt} WHERE id=${subscriptionId}`
    //             const subscription = this.parseRow(result.rows[0]);
    //             subscription.setEnededAt(endedAt ? endedAt : 0)
    //             resolve( subscription)
    //         } catch(e) {
    //             reject(e)
    //         }
    //     })
    // }

    // create a Subscription from a result row (*)
    public parseRow(row:any):Subscription {
        return new Subscription(row.id, row.customer_id, row.plan_id, row.period_end, row.ended_at)
    }

}