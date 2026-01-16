


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

    static saveAttribution(attributionString: string) {
        // Parse string "key:value" or just store as content/source if simple
        // For now adhering to the request "record a specific attribution data"
        // The existing capture expects query params logic, let's adapt or just simple store
        // The user request example was just "record a specific attribution data".

        // Let's reuse the Capture logic structure but for a manual string. 
        // Or simpler: just store it as source if it matches "source:value" pattern, or content otherwise.

        const data: AttributionData = {
            timestamp: Date.now()
        }

        if (attributionString.startsWith('source:')) {
            data.source = attributionString.substring(7)
        } else {
            data.content = attributionString
        }

        // console.debug('[AttributionService] Saving manual attribution data', data)
        localStorage.setItem(LocalStoreService.attribution, JSON.stringify(data))
    }
}
