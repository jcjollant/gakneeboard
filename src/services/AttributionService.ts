


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

    static initFromWindow() {
        const params = new URLSearchParams(window.location.search)
        const query: Record<string, string> = {}
        for (const [key, value] of params) {
            query[key] = value
        }
        AttributionService.capture(query)
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
