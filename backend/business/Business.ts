import { SubscriptionDao } from "../dao/SubscriptionDao";
import { UsageDao } from "../dao/UsageDao";
import { UserDao } from "../dao/UserDao";
import { Email, EmailType } from "../Email";
import { AccountType } from "../models/AccountType";
import { Refill } from "../models/Refill";
import { User } from "../models/User";
import { Ticket } from "../Ticket";

class Quota {
    prints:number;
    pages:number;
    templates:number;
    constructor(prints:number, pages:number, templates:number) {
        this.prints = prints;
        this.pages = pages;
        this.templates = templates;
    }
}

export class Business {
    static PRINT_PER_PURCHASE: number = 10;

    static PRINT_CREDIT_SIMMER: number = 4;
    static MAX_PAGES_SIMMER: number = 2;
    static MAX_TEMPLATE_SIMMER: number = 1;

    static PRINT_CREDIT_STUDENT: number = 8;
    static MAX_PAGES_STUDENT: number = 4;
    static MAX_TEMPLATE_STUDENT: number = 2;

    static PRINT_CREDIT_PRIVATE:number = 16;
    static MAX_PAGES_PRIVATE: number = 20;
    static MAX_TEMPLATE_PRIVATE: number = 5;

    static PRINT_CREDIT_BETA:number = -1;
    static MAX_PAGES_BETA: number = 50;
    static MAX_TEMPLATE_BETA: number = 10;
    
    static latestEula:number = 20250821;

    public static calculatePrintCredits(user:User):number {
        return Math.max( user.printCredits, Business.getQuotas(user).prints)
    }

    static getQuotas(user:User):Quota {
        switch(user.accountType) {
            case AccountType.student: 
                return new Quota(this.PRINT_CREDIT_STUDENT, this.MAX_PAGES_STUDENT, this.MAX_TEMPLATE_STUDENT)
            case AccountType.private: 
                return new Quota(this.PRINT_CREDIT_PRIVATE, this.MAX_PAGES_PRIVATE, this.MAX_TEMPLATE_PRIVATE)
            case AccountType.beta: 
                return new Quota(this.PRINT_CREDIT_BETA, this.MAX_PAGES_BETA, this.MAX_TEMPLATE_BETA)
            default:
                return new Quota(this.PRINT_CREDIT_SIMMER, this.MAX_PAGES_SIMMER, this.MAX_TEMPLATE_SIMMER)
        }
    }

    static isActiveCustomer(user:User):boolean {
        return user.accountType == AccountType.beta || user.accountType == AccountType.private || user.accountType == AccountType.student;
    }

    static maxTemplates(user:User):number {
        return this.maxTemplatesFromAccountType(user.accountType)
    }

    static maxTemplatesFromAccountType(accountType:AccountType):number {
        switch(accountType) {
            case AccountType.private: return this.MAX_TEMPLATE_PRIVATE;
            case AccountType.beta:    return this.MAX_TEMPLATE_BETA;
            case AccountType.simmer:  return this.MAX_TEMPLATE_SIMMER;
            case AccountType.student: return this.MAX_TEMPLATE_STUDENT;
            default:
                return 0;
        }
    }
    
    static monthlyRevenue(user: User):number {
        switch(user.accountType) {
            case AccountType.private: return 4.49;
            case AccountType.beta:    return 3.49;
            case AccountType.student: return 2.99;
            case AccountType.simmer:
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
        const quotas = this.getQuotas(user)

        // Unlimited users do not consume prints
        if( quotas.prints == -1) return true;

        // user with quotas are metered
        if(user.printCredits <= 0) return false; // Broke bro
        // use one tocken
        user.printCredits--
        await userDao.updatePrintCredit(user)

        // console.log('[Business.printConsume] ' + user.id + ' consumed a print, ' + user.printCredits + ' remaining')
        return true
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
     * Refills account if we are on the first day of the month or force is true
     * @param userDao
     * @param force If true, refills even if it's not the first day of the month
     * @returns A map of updated counts
     */
    static async printRefills(userDao:UserDao, force:boolean=false):Promise<Refill[]> {
        const dayOfTheMonth = new Date().getDate()
        if(!force && dayOfTheMonth != 1) return []

        const refills = await userDao.refill( this.PRINT_CREDIT_SIMMER, AccountType.simmer)
        // create a usage record for each refill
        for(const refill of refills) {
            await UsageDao.refill(refill.userId, refill.previousCount, refill.newCount)
        }

        return refills;
    }

    // revert the acount back to simmer
    static async subscriptionStop(subscriptionId: string, customerId: string, userDao:UserDao):Promise<User> {
        return new Promise( async (resolve, reject) => {
            if(!subscriptionId) return reject('Subscription Id is required');
            if(!customerId) return reject('Customer Id is required');

            const user = await userDao.getFromCustomerId(customerId)
            await Business.updateAccountType(user, AccountType.simmer, userDao)

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

        // Refresh account type
        await Business.updateAccountType(user, newAccountType, userDao)

        // update print credits
        try {
            const previousPrintCredits = user.printCredits
            user.printCredits = Business.calculatePrintCredits(user)
            if(previousPrintCredits != user.printCredits) {
                await userDao.updatePrintCredit(user)
                await UsageDao.refill(user.id, previousPrintCredits, user.printCredits)
            }
        } catch( e) {
            Ticket.create(2, 'Failed to update print credits ' + e)
        }
    }

    static async updateAccountType(user:User, newAccountType:AccountType, userDao:UserDao):Promise<User> {
        // update account type
        user.accountType = newAccountType
        const quotas = this.getQuotas(user)
        user.maxTemplates = quotas.templates
        user.maxPages = quotas.pages
        user.printCredits = quotas.prints

        await userDao.updateType(user)

        const message = 'user ' + user.id + ' updated to ' + user.accountType
        // console.log('[Business.updateAccountType]', message)
        await Email.send(message, EmailType.Purchase)

        return user;
    }
}