import { SubscriptionDao } from "../dao/SubscriptionDao";
import { UserDao } from "../dao/UserDao";
import { Email, EmailType } from "../Email";
import { AccountType } from "../models/AccountType";
import { Refill } from "../models/Refill";
import { User } from "../models/User";

export class Business {
    static PRINT_PER_PURCHASE: number = 10;
    static PRINT_CREDIT_SIMMER: number = 4;
    static PRINT_CREDIT_PRIVATE:number = 10;
    static MAX_TEMPLATE_SIMMER: number = 2;
    static MAX_TEMPLATE_PRIVATE: number = 5;
    static MAX_TEMPLATE_BETA: number = 10;

    public static calculatePrintCredits(user:User):number {
        let credit = 0;
        
        switch(user.accountType) {
            case AccountType.simmer: credit = this.PRINT_CREDIT_SIMMER; break;
            case AccountType.private: credit = this.PRINT_CREDIT_PRIVATE; break;
        }
        return Math.max( user.printCredits, credit)
    }

    static maxTemplates(user:User):number {
        return this.maxTemplatesFromAccountType(user.accountType)
    }

    static maxTemplatesFromAccountType(accountType:AccountType):number {
        switch(accountType) {
            case AccountType.private: return this.MAX_TEMPLATE_PRIVATE;
            case AccountType.beta:    return this.MAX_TEMPLATE_BETA;
            case AccountType.simmer:  return this.MAX_TEMPLATE_SIMMER;
            default:
                return 0;
        }
    }
    
    /**
     * Decides what to do when a User wants to consume one print
     * @param user 
     * @param userDao 
     * @returns true if user can print, false if not
     */
    static async printConsume(user: User, userDao: UserDao):Promise<boolean> {
        const accountType = user.accountType
        if(accountType == AccountType.beta) {
            return true;
        } else if(accountType == AccountType.simmer || accountType == AccountType.private) {
            // simmer and private accounts are metered
            if(user.printCredits <= 0) return false; // Broke bro
            // use one tocken
            user.printCredits--
            await userDao.updatePrintCredit(user)
            // console.log('[Business.printConsume] ' + user.id + ' consumed a print, ' + user.printCredits + ' remaining')
            return true
        }
        // other account types are not known
        return false
    }

    /**
     * This is a one off purchase
     * @param customerId Customer whom made the purchase
     * @param count Number of prints purchased
     * @returns The corresponding user
     */
    static async printPurchase(customerId:string, count:number, userDao:UserDao):Promise<User> {
        return new Promise( async (resolve, reject) => {
            if(!customerId) return reject('Customer Id is required');
            if(count <= 0) return reject('Count is invalid');

            userDao.getFromCustomerId(customerId).then( async (user) => {
                userDao.addPrints(user, count).then( async (user) => {
                    const message = 'user ' + user.id + ' purchased ' + count + ' prints'
                    // console.log('[Business.printPurchase] ' + message)
                    await Email.send(message, EmailType.Purchase)
                    resolve(user)
                }).catch( (err) => {
                    console.log('[Business.printPurchase] failed to add prints ' + err)
                    reject(err)
                })
            }).catch( (err) => {
                console.log('[Business.printPurchase] failed ' + err)
                reject(err)
            })
        })
    }

    /**
     * Refills account if we are on the first day of the month
     * @param userDao
     * @param force If true, refills even if it's not the first day of the month
     * @returns A map of updated counts
     */
    static async printRefills(userDao:UserDao, force:boolean=false):Promise<Refill[]> {
        const dayOfTheMonth = new Date().getDate()
        if(!force && dayOfTheMonth != 1) return []

        const simmerRefills = await userDao.refill( this.PRINT_CREDIT_SIMMER, AccountType.simmer)
        const privateRefills = await userDao.refill( this.PRINT_CREDIT_PRIVATE, AccountType.private)

        // combine both arrays into refills
        // const refills = simmerRefills.concat(privateRefills)
        const refills = [...simmerRefills, ...privateRefills]

        return refills;
    }

    // revert the acount back to simmer
    static async subscriptionStop(subscriptionId: string, customerId: string, userDao:UserDao):Promise<User> {
        return new Promise( async (resolve, reject) => {
            if(!subscriptionId) return reject('Subscription Id is required');
            if(!customerId) return reject('Customer Id is required');

            const user = await userDao.getFromCustomerId(customerId)
            user.accountType = AccountType.simmer
            await Business.updateAccountType(user, userDao)

            resolve(user)
        })
    }

    /**
     * Update user account type and prints based of this subscription
     * @param subscriptionId 
     * @param customerId 
     * @param priceId 
     * @param newAccountType 
     * @param periodEnd 
     * @param cancelAt 
     * @param endedAt 
     * @param userDao to access user data
     * @param subscriptionDao to access subscription data
     */
    static async subscriptionUpdate(subscriptionId: string, customerId: string, priceId:string, newAccountType: AccountType, 
        periodEnd: number, cancelAt: number | null, endedAt:number|null, 
        userDao:UserDao, subscriptionDao:SubscriptionDao) {
        // Make sure we don't subscribe to crap
        if(newAccountType == AccountType.unknown) throw new Error('Account type is unknown');

        // console.log('[Business.subscriptionUpdate]', customerId, subscriptionId, planId, newAccountType, periodEnd, cancelAt)
        // const sub:Subscription = await SubscriptionDao.update(subscriptionId, customerId, priceId, periodEnd, cancelAt, endedAt)
        // const user = await userDao.getUserFromCustomerId(customerId)
        const [sub, user] = await Promise.all([
            subscriptionDao.update(subscriptionId, customerId, priceId, periodEnd, cancelAt, endedAt), 
            userDao.getFromCustomerId(customerId)])

        // update account type
        user.accountType = newAccountType

        // New subscription nay need print refill
        if(sub.isBrandNew()) {
            user.printCredits = Business.calculatePrintCredits(user)
            await userDao.updatePrintCredit(user)
        }

        // Refresh account type
        await Business.updateAccountType(user, userDao)
    }

    static async updateAccountType(user:User, userDao:UserDao):Promise<User> {
        await userDao.updateType(user)
        const message = 'user ' + user.id + ' updated to ' + user.accountType
        // console.log('[Business.updateAccountType]', message)
        await Email.send(message, EmailType.Purchase)
        return user;
    }
}