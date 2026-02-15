
// import { Airport } from '../models/Airport'
// import { User } from "../models/User"
// import { Template } from "../models/Template"
// import { Notam } from '../models/Notam'

const MAX_NOTAMS_AGE = 6 * 60 * 60 * 1000 // 6 hours
const MAX_METAR_AGE = 15 * 60 * 1000 // 15 minutes

export class LocalStoreService {
    static airportPrefix: string = 'airport-'
    static approachPrefix: string = 'apch-'
    static notamsPrefix: string = 'notams-'
    static metarPrefix: string = 'metar-'
    static user: string = 'user'
    static userOld: string = 'kb-user'
    static howDoesItWork_deprecated: string = 'howDoesItWork'
    static popup: string = 'popup'
    static recentAirports: string = 'airports'
    static recentApproaches: string = 'approaches'
    static template = 'template'
    static templateOld = 'sheet'
    static templateOlder = 'page1'
    static templatePrefix = 'template-'
    static thumbnailPrefix = 'tthumb-'
    static flightInfo = 'flightInfo'
    static attribution = 'channel-attribution'
    static tempHomeAirport = 'temp-home-airport'
    static MAX_AIRPORTS = 30
    static MAX_APPROACHES = 5
    static LEAN_AIRPORTS = 24

    static listeners: (() => void)[] = []

    static subscribe(callback: () => void): () => void {
        LocalStoreService.listeners.push(callback)
        return () => {
            LocalStoreService.listeners = LocalStoreService.listeners.filter(l => l !== callback)
        }
    }

    static notify() {
        LocalStoreService.listeners.forEach(l => l())
    }

    // return active user
    static getUser(): any | undefined {
        const userString = localStorage.getItem(LocalStoreService.user)
        if (userString) {
            return JSON.parse(userString)
        }
        return undefined;
    }
}