
import { Router } from 'vue-router'

export interface AttributionData {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
    timestamp: number
}

import { LocalStoreService } from './LocalStoreService'

export class AttributionService {

    static init(router: Router) {
        // We check the current route once on initialization
        // Note: When called from main.js router.isReady(), currentRoute should be resolved
        const currentRoute = router.currentRoute.value

        if (currentRoute) {
            AttributionService.capture(currentRoute.query)
        }
    }

    static capture(query: Record<string, any>) {
        const data: AttributionData = {
            timestamp: Date.now()
        }
        let found = false

        if (query.utm_source) { data.source = String(query.utm_source); found = true; }
        if (query.utm_medium) { data.medium = String(query.utm_medium); found = true; }
        if (query.utm_campaign) { data.campaign = String(query.utm_campaign); found = true; }
        if (query.utm_term) { data.term = String(query.utm_term); found = true; }
        if (query.utm_content) { data.content = String(query.utm_content); found = true; }

        if (found) {
            // console.debug('[AttributionService] Capturing attribution data', data)
            localStorage.setItem(LocalStoreService.attribution, JSON.stringify(data))
        } else {
            // console.debug('[AttributionService] No attribution data found')
        }
    }

    static getAttribution(): AttributionData | null {
        const data = localStorage.getItem(LocalStoreService.attribution)
        if (data) {
            return JSON.parse(data)
        }
        return null
    }
}
