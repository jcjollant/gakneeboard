import axios from 'axios'
import { CurrentUser } from '../assets/CurrentUser'
import { UrlService } from './UrlService'

import { AttributionService } from './AttributionService'

export class CheckoutService {

    static async manage(user: CurrentUser): Promise<string> {
        return CheckoutService.plan('manage', user)
    }


    static async plan(code: string, user: CurrentUser): Promise<string> {
        try {
            const url = UrlService.root + 'stripe/checkout'
            const payload: any = { user: user.sha256, product: code, source: window.location.href }

            const attribution = AttributionService.getAttribution()
            if (attribution) {
                payload.attribution = attribution
            }

            // console.debug('[Checkout.plan]', payload)
            // console.debug('[Checkout.plan] attribution', attribution)
            const headers = { headers: { 'Content-Type': 'application/json' } }
            const response = await axios.post(url, payload, headers)
            return response.data.url
        } catch (error) {
            console.log(error)
            throw '/'
        }
    }
}
