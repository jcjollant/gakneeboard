import axios from 'axios'
import { CurrentUser } from '../assets/CurrentUser'
import { GApiUrl } from '../lib/GApiUrl'
import { AccountType } from '../models/AccounType'

export class Pricing {
    static simmer = 'fs1';
    static studentPilot = 'pp1'; // This is the old private pilot.
    static privatePilot = 'pp2';
    static hobbs = 'hh1';
    static betaDeal = 'bd1';
    static lifetimeDeal = 'ld1'
}

export class CheckoutService {

    static accountTypeFromPricing(pricing: Pricing): AccountType {
        switch (pricing) {
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
            case Pricing.studentPilot:
                return AccountType.beta;
            case Pricing.hobbs:
                return AccountType.hobbs;
            case Pricing.lifetimeDeal:
                return AccountType.lifetime;
            default:
                return AccountType.unknown;
        }
    }

    static async manage(user: CurrentUser): Promise<string> {
        return CheckoutService.plan('manage', user)
    }


    static async plan(code: string, user: CurrentUser): Promise<string> {
        try {
            const url = GApiUrl.root + 'stripe/checkout'
            const payload = { user: user.sha256, product: code, source: window.location.href }
            // console.log('[Checkout.plan]', payload)
            const headers = { headers: { 'Content-Type': 'application/json' } }
            const response = await axios.post(url, payload, headers)
            return response.data.url
        } catch (error) {
            console.log(error)
            throw '/'
        }
    }
}
