import axios from 'axios'
import { CurrentUser } from './CurrentUser'
import { GApiUrl } from '../lib/GApiUrl'
import { AccountType } from '../model/AccounType'

export class Pricing {
    static simmer = 'fs1';
    static studentPilot = 'pp1'; // This is the old private pilot.
    static privatePilot = 'pp2';
    static hobbs = 'hh1';
    static betaDeal = 'bd1';
    static lifetimeDeal = 'ld1'
}

export class Checkout {

    static accountTypeFromPricing(pricing:Pricing): AccountType {
        switch(pricing) {
            // case Pricing.privateMonthly:
            // case Pricing.privateAnnual:
            //     return AccountType.private;
            // case Pricing.instrumentMonthly:
            // case Pricing.instrumentAnnual:
            //     return AccountType.instrument;
            case Pricing.simmer:
                return AccountType.simmer;
            case Pricing.betaDeal:
            case Pricing.privatePilot:
                return AccountType.beta;
            case Pricing.hobbs:
                return AccountType.hobbs;
            case Pricing.lifetimeDeal:
                return AccountType.lifetime;
            default:
                return AccountType.unknown;
        }
    }

    static async manage(user:CurrentUser):Promise<string> {
        return Checkout.plan('manage', user)
    }


    static async plan(code:Pricing, user:CurrentUser):Promise<string> {
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