import { sql } from "@vercel/postgres"
import { Subscription } from "../models/Subscription"
import { UserDao } from "./UserDao"

export class SubscriptionDao {
    
    /**
     * Update an existing subscription
     * @param subscriptionId 
     * @param customerId 
     * @param planId 
     * @returns 
     */
    public static async update(subscriptionId:string, customerId:string, planId:string|undefined, userId:number|undefined):Promise<Subscription> {
        // console.log('[SubsriptionDao.update] subscriptionId', subscriptionId, 'customerId', customerId, 'planId', planId, 'userId', userId)
        return new Promise<Subscription>(async (resolve, reject) => {
            if(!planId && !userId) reject( 'Need either plan id or user id provided')

            const result = await sql`SELECT plan_id, user_id FROM subscriptions WHERE id=${subscriptionId}`
            // console.log('[SubsriptionDao.update] matches', result.rowCount)
            let sub:Subscription = new Subscription(subscriptionId, customerId, planId, userId);
            if(result.rowCount > 0) { // update
                if(planId && userId) {
                    await sql`UPDATE subscriptions SET plan_id=${planId}, user_id=${userId} WHERE id=${subscriptionId}`
                } else if( planId) {
                    await sql`UPDATE subscriptions SET plan_id=${planId} WHERE id=${subscriptionId}`
                    sub.userId = result.rows[0].user_id
                } else {
                    await sql`UPDATE subscriptions SET user_id=${userId} WHERE id=${subscriptionId}`
                    sub.planId = result.rows[0].plan_id
                }
            } else { // initial creation
                await sql`INSERT INTO subscriptions (id, customer_id, plan_id, user_id) VALUES (${subscriptionId},${customerId},${planId},${userId})`
                console.log('[SubsriptionDao.update] created new subscription ' + subscriptionId)
            }
            resolve(sub)
        })
    }
}