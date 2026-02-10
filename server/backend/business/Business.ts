import { SubscriptionDao } from "../dao/SubscriptionDao";
import { UsageDao } from "../dao/UsageDao";
import { UserDao } from "../dao/UserDao";
import { Email, EmailType } from "../Email";
import { AccountType, PLAN_ID_SIM, PlanDescription, PLANS, PRINT_CREDIT_SIMMER, Quotas } from '@gak/shared';
import { Refill } from "../models/Refill";
import { User } from "../models/User";
import { TicketService } from "../services/TicketService";
import { PlanService } from "../services/PlanService";
import Stripe from "stripe";

export class Business {
    static async createProductPurchase(customerId: string, productId: string, customerDetails: Stripe.Checkout.Session.CustomerDetails, shippingDetails: Stripe.Checkout.Session.ShippingDetails) {
        console.debug('[Business.createProductPurchase] Creating product purchase for customer ' + customerId + ' and product ' + productId);
        try {
            const userDao = new UserDao()
            const user = await userDao.getFromCustomerId(customerId)
            const userId = user?.id || customerId
            let message = `Product Purchase: ${productId}\n`;
            message += `User Email: ${customerDetails?.email} , id: ${userId}\n`;
            message += `Name: ${customerDetails?.name}\n`;
            if (shippingDetails) {
                message += `Shipping Address:\n`;
                message += `${shippingDetails.name}\n`;
                message += `${shippingDetails.address?.line1}\n`;
                if (shippingDetails.address?.line2) message += `${shippingDetails.address?.line2}\n`;
                message += `${shippingDetails.address?.city}, ${shippingDetails.address?.state} ${shippingDetails.address?.postal_code}\n`;
                message += `${shippingDetails.address?.country}\n`;
            } else {
                message += `No shipping details provided.\n`;
            }

            // create a ticket for follow up and send an email
            const [ticketCreated, emailSent] = await Promise.all([
                TicketService.create(3, 'Product Purchase ' + productId + ' for user ' + userId),
                Email.send(message, EmailType.Purchase)
            ]);

            if (!ticketCreated || !emailSent) {
                console.error('[Business.createProductPurchase] Warning: ticket created:', ticketCreated, 'email sent:', emailSent);
            }
        } catch (err) {
            console.error('[Business.createProductPurchase] Exception:', err);
            const fallbackCreated = await TicketService.create(2, 'Product Purchase creation failed ' + productId + ' for user ' + customerId + ' failed ' + err);
            if (!fallbackCreated) {
                console.error('[Business.createProductPurchase] CRITICAL: Fallback ticket creation also failed');
            }
        }
    }

    static latestEula: number = 20250821;

    public static calculatePrintCredits(user: User): number {
        return Math.max(user.printCredits, Business.getQuotas(user).prints)
    }

    public static getQuotas(user: User): Quotas {
        const plan = PlanService.getPlan(user.planId)
        return plan?.quotas || { prints: 0, pages: 0, templates: 0 }
    }

    static isActiveCustomer(user: User): boolean {
        return user.accountType != AccountType.simmer && user.accountType != AccountType.unknown;
    }

    static maxTemplates(user: User): number {
        const quota = this.getQuotas(user)
        return quota.templates
    }

    static monthlyRevenue(user: User): number {
        switch (user.accountType) {
            case AccountType.private:
                return 4.49;
            case AccountType.beta:
                return 3.49;
            case AccountType.student:
                return 2.99;
            case AccountType.simmer:
            case AccountType.lifetime:
            default:
                return 0;
        }
    }

    /**
     * Set a user up with the default simmer account
     * @param user 
     */
    static primeUser(user: User) {
        user.setAccountType(AccountType.simmer)
        user.setPlanId(PLAN_ID_SIM)
        const quotas = Business.getQuotas(user)
        user.printCredits = quotas.prints
        user.maxTemplates = quotas.templates
        user.maxPages = quotas.pages
    }

    /**
     * Decides what to do when a User wants to consume one print
     * @param user 
     * @param userDao 
     * @returns true if user can print, false if not
     */
    static async printConsume(user: User, userDao: UserDao): Promise<boolean> {
        const accountType = user.accountType
        const quotas = this.getQuotas(user)

        // Unlimited users do not consume prints
        if (quotas.prints == -1) return true;

        // user with quotas are metered
        if (user.printCredits <= 0) return false; // Broke bro
        // use one tocken
        user.printCredits--
        await userDao.updatePrintCredit(user)

        return true
    }

    /**
     * Refills account if we are on the first day of the month or force is true
     * @param userDao
     * @param force If true, refills even if it's not the first day of the month
     * @returns A map of updated counts and boolean that indicates if a refill was performed
     */
    static async freePrintRefills(userDao: UserDao, force: boolean = false): Promise<[Refill[], boolean]> {
        const dayOfTheMonth = new Date().getDate()

        // onyl refill on the first day of the month or when forced by parameter
        if (!force && dayOfTheMonth != 1) return [[], false]

        const refills = await userDao.refillAccountType(AccountType.simmer, PRINT_CREDIT_SIMMER)
        // create a usage record for each refill
        for (const refill of refills) {
            await UsageDao.refill(refill.userId, refill.previousCount, refill.newCount)
        }

        return [refills, true];
    }

    // revert the acount back to simmer
    static async subscriptionStop(subscriptionId: string, customerId: string, userDao: UserDao, cancelAt: number, endedAt: number): Promise<User> {
        return new Promise(async (resolve, reject) => {
            if (!subscriptionId) return reject('Subscription Id is required');
            if (!customerId) return reject('Customer Id is required');

            const user = await userDao.getFromCustomerId(customerId)
            if (!user) return reject('User not found ' + customerId);
            // update cancellation
            const subscriptionDao = new SubscriptionDao()
            await subscriptionDao.updateCancellation(subscriptionId, cancelAt, endedAt)
            if (user.accountType != AccountType.lifetime) {
                await Business.updateAccountType(user, AccountType.simmer, PLAN_ID_SIM, userDao, 'subscription stop')
            }

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
    static async subscriptionUpdate(subscriptionId: string, customerId: string, priceId: string, plan: PlanDescription,
        periodEnd: number, cancelAt: number | null, endedAt: number | null,
        userDao: UserDao, subscriptionDao: SubscriptionDao) {
        // Make sure we don't subscribe to crap
        if (plan.accountType == AccountType.unknown) throw new Error('Account type is unknown');

        // console.log('[Business.subscriptionUpdate]', customerId, subscriptionId, plan.id, plan.accountType, periodEnd, cancelAt)
        // const sub:Subscription = await SubscriptionDao.update(subscriptionId, customerId, priceId, periodEnd, cancelAt, endedAt)
        // const user = await userDao.getUserFromCustomerId(customerId)
        await Promise.all([
            subscriptionDao.update(subscriptionId, customerId, priceId, periodEnd, cancelAt, endedAt),
            Business.upgradeUser(customerId, plan.accountType, plan.id, userDao, 'subscription update')])
    }

    static async upgradeUser(customerId: string, newAccountType: AccountType, planId: string, userDao: UserDao, trigger?: string) {
        const user = await userDao.getFromCustomerId(customerId)
        if (!user) {
            TicketService.create(2, 'Cannot upgrade user, user not found ' + customerId)
            return;
        }
        const previousPrintCredits = user.printCredits
        await Business.updateAccountType(user, newAccountType, planId, userDao, trigger)

        // update print credits
        try {
            user.printCredits = Business.calculatePrintCredits(user)
            if (previousPrintCredits != user.printCredits) {
                await userDao.updatePrintCredit(user)
                await UsageDao.refill(user.id, previousPrintCredits, user.printCredits)
            }
        } catch (e) {
            TicketService.create(2, 'Failed to update print credits ' + e)
        }
    }

    static async updateAccountType(user: User, newAccountType: AccountType, planId: string, userDao: UserDao, trigger?: string): Promise<User> {
        // update account type
        user.accountType = newAccountType
        user.planId = planId
        const quotas = this.getQuotas(user)
        user.maxTemplates = quotas.templates
        user.maxPages = quotas.pages
        user.printCredits = quotas.prints

        await userDao.updateType(user)

        let message = 'User ' + user.id + ' updated to ' + user.accountType
        if (trigger) message += '\nTriggered by ' + trigger
        // console.log('[Business.updateAccountType]', message)
        await Email.send(message, EmailType.Purchase)

        return user;
    }
}