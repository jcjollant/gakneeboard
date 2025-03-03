import { SubscriptionDao } from "../dao/SubscriptionDao";
import { UserDao } from "../dao/UserDao";
import { Email, EmailType } from "../Email";
import { AccountType } from "../models/AccountType";
import { User } from "../models/User";

export class Business {
    static maxPagesFromAccountType(accountType:AccountType):number {
        switch(accountType) {
            // case AccountType.instrument: 
            //     return 50;
            // case AccountType.private: 
            //     return 20;
            case AccountType.beta: 
                return 5;
            case AccountType.simmer:
            default:
                return 0;
        }
    }
    
    static async purchasePrints(customerId:string, count:number):Promise<User> {
        return new Promise( async (resolve, reject) => {
            if(!customerId) return reject('Customer Id is required');
            if(!count) return reject('Count is required');

            const userDao = new UserDao()
            userDao.getUserFromCustomerId(customerId).then( async (user) => {
                userDao.addPrints(user, count).then( async (user) => {
                    const message = 'user ' + user.id + ' purchased ' + count + ' prints'
                    // console.log('[Business.purchasePrints] ' + message)
                    await Email.send(message, EmailType.Purchase)
                    resolve(user)
                }).catch( (err) => {
                    console.log('[Business.purchasePrints] failed to add prints ' + err)
                    reject(err)
                })
            }).catch( (err) => {
                console.log('[Business.purchasePrints] failed ' + err)
                reject(err)
            })
        })
    }

    static async subscriptionStop(subscriptionId: string, customerId: string) {
        await Business.updateAccountType(customerId, AccountType.simmer)
    }

    static async subscriptionUpdate(subscriptionId: string, customerId: string, planId:string, newAccountType: AccountType, periodEnd: number, cancelAt: number | null) {
        // console.log('[Business.subscriptionUpdate]', customerId, subscriptionId, planId, newAccountType, periodEnd, cancelAt)
        await SubscriptionDao.update(subscriptionId, customerId, planId, periodEnd, cancelAt)
        await Business.updateAccountType(customerId, newAccountType)
    }

    static updateAccountType(customerId:string,newAccountType:AccountType):Promise<User> {
        return new Promise<User>( async (resolve, reject) => {
            if(!customerId) return reject('Customer Id is required');
            if(newAccountType == AccountType.unknown) return reject('Account type is required');

            const userDao = new UserDao()
            userDao.getUserFromCustomerId(customerId).then( async (user) => {
                userDao.updateType(user.id, newAccountType).then( async () => {
                    const message = 'user ' + user.id + ' updated to ' + newAccountType
                    // console.log('[Business.updateAccountType]', message)
                    await Email.send(message, EmailType.Purchase)
                    resolve(user)
                }).catch(e => {
                    console.log('[Business.updateAccountType] failed to update user type ' + e);
                    reject(e)
                })
            }).catch( (err) => {
                console.log('[Business.updateAccountType] failed ' + err)
                reject(err)
            })
        })
    }
}