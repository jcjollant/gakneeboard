import axios from 'axios'
import { CurrentUser } from './CurrentUser'
import { GApiUrl } from '../lib/GApiUrl'
import { AccountType } from '../model/AccounType'

export class Pricing {
    static simmer = 'fs1';
    static private = 'pp1';
    static instrument = 'ip1';
}

export class Checkout {

    static pricingFromAccountType(accountType: AccountType): string {
        switch( accountType) {
            case AccountType.private: 
                return Pricing.private;
            case AccountType.instrument: 
                return Pricing.instrument;
            default:
            case AccountType.simmer: 
                return Pricing.simmer;
        }
    }

    static async manage(user:CurrentUser):Promise<string> {
        return Checkout.plan('manage', user)
    }


    static async plan(code:string, user:CurrentUser):Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const url = GApiUrl.root + 'stripe/checkout'
            const payload = {user:user.sha256, product:code, source:window.location.href}
            // console.log('[Checkout.plan]', payload)
            const headers = { headers: {'Content-Type':'application/json'} }
            await axios.post(url, payload, headers).then( response => {
                resolve(response.data.url)
            }).catch( error => {
                console.log(error)
                reject('/')
            })
        })
    }
}