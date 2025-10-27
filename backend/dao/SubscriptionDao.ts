import { sql } from "@vercel/postgres"
import { Subscription } from "../models/Subscription"
import { Dao } from "./Dao";
import { table } from "console";

export class SubscriptionDao extends Dao<Subscription> {
    protected tableName: string = 'subscriptions';

    /**
     * Create a new subscription record
     * @param subscriptionId 
     * @param customerId 
     * @param priceId 
     * @param periodEnd End of the current billing period
     * @returns The corresponding subscription
     */
    public async update(subscriptionId:string, customerId:string, priceId:string, periodEnd:number, cancelAt:number|null, endedAt:number|null):Promise<Subscription> {
        // console.log('[SubsriptionDao.update] subscriptionId', subscriptionId, 'customerId', customerId, 'planId', planId, 'userId', userId)
        return new Promise<Subscription>(async (resolve, reject) => {
            // console.log('[SubsriptionDao.update] matches', result.rowCount)
            let sub:Subscription = new Subscription(subscriptionId, customerId, priceId, periodEnd);
            const result = await this.db.query(`SELECT id FROM ${this.tableName} WHERE id='${subscriptionId}'`)
            if(result.rowCount == 0) {
                await this.db.query(`INSERT INTO ${this.tableName} (id, customer_id, price_id, period_end, cancel_at, ended_at) VALUES ('${subscriptionId}','${customerId}','${priceId}',${periodEnd}, ${cancelAt}, ${endedAt})`)
                sub.setBrandNew(true)
                // console.log('[SubscriptionDao.create] created new subscription ')
            } else {
                await this.db.query(`UPDATE ${this.tableName} SET customer_id='${customerId}', price_id='${priceId}', period_end=${periodEnd}, cancel_at=${cancelAt}, ended_at=${endedAt} WHERE id='${subscriptionId}'`)
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

    /**
     * Get count of new customers in the past 30 days
     * @returns Promise<number>
     */
    public async getNewCustomersLast30Days():Promise<number> {
        const result = await this.db.query(`
            SELECT DISTINCT u.*
            FROM users u
            JOIN subscriptions s ON u.customer_id = s.customer_id
            WHERE u.account_type != 'sim'
            AND s.create_time >= NOW() - INTERVAL '30 days'
        `);
        return result.rowCount || 0;
    }

    /**
     * Get count of churned customers in the past 30 days
     * @returns Promise<number>
     */
    public async getChurnLast30Days():Promise<number> {
        const result = await this.db.query(`
            SELECT *
            FROM subscriptions
            WHERE cancel_at >= EXTRACT(EPOCH FROM NOW() - INTERVAL '120 days')
            AND cancel_at IS NOT NULL
        `);
        return result.rowCount || 0;
    }

}