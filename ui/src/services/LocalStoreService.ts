import { Airport } from '../models/Airport'
import { User } from "../models/User"
import { Template } from "../models/Template"
import { Notam } from '../models/Notam'

const MAX_NOTAMS_AGE = 6 * 60 * 60 * 1000

export class LocalStoreService {
    static airportPrefix: string = 'airport-'
    static approachPrefix: string = 'apch-'
    static notamsPrefix: string = 'notams-'
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

    static airportAdd(code: string, airport: any) {
        if (!airport) return;
        localStorage.setItem(LocalStoreService.airportPrefix + airport.code, JSON.stringify(airport))
        LocalStoreService.airportRecentsUpdate(code)
        LocalStoreService.notify()
    }

    static airportCleanUp() {
        // clean up airports cache above threshold
        const airportList = localStorage.getItem(LocalStoreService.recentAirports)
        if (airportList) {
            const airportCodes = airportList.split('-')
            if (airportCodes.length > LocalStoreService.MAX_AIRPORTS) {
                // reduce recent list to lean size
                airportCodes.splice(0, airportCodes.length - LocalStoreService.LEAN_AIRPORTS)
                for (var key in localStorage) {
                    // console.log('[LocalStoreService.cleanup] key ' + key)
                    if (key.startsWith(LocalStoreService.airportPrefix)) {
                        const code = key.substring(LocalStoreService.airportPrefix.length)
                        if (airportCodes.indexOf(code) < 0) {
                            console.log('[LocalStoreService.cleanUp] removing', key)
                            localStorage.removeItem(key)
                        }
                    }
                }

                // replace recent list with most recent
                const newRecentAirport = airportCodes.join('-')
                console.log('[LocalStoreService.cleanUp] new recent airports', newRecentAirport)
                localStorage.setItem(LocalStoreService.recentAirports, newRecentAirport)
                LocalStoreService.notify()
            }
        }
    }

    /**
     * Finds an airport by code in the local store
     * @param code Airport code
     * @returns 
     */

    static airportGet(code: string): Airport {
        const storeAirport = localStorage.getItem(LocalStoreService.airportPrefix + code)
        if (storeAirport) {
            LocalStoreService.airportRecentsUpdate(code)
            return Airport.copy(JSON.parse(storeAirport))
        } else {
            // remove from recent list
            LocalStoreService.airportRecentsRemove(code)
            // Throw new error
            throw new Error('Airport ' + code + ' not found in local store')
        }
    }

    static airportRecentsRemove(code: string) {
        let recentAirports = localStorage.getItem(LocalStoreService.recentAirports)
        if (recentAirports) {
            const recentList = recentAirports.split('-')
            if (recentList.includes(code)) {
                // remove from list
                recentList.splice(recentList.indexOf(code), 1)
                recentAirports = recentList.join('-')
                localStorage.setItem(LocalStoreService.recentAirports, recentAirports)
                LocalStoreService.notify()
            }
        }
    }

    static airportRecentsGet(count?: number): string[] {
        let recentAirports = localStorage.getItem(LocalStoreService.recentAirports)
        if (recentAirports) {
            const airports = recentAirports.split('-')
            if (count && count > 0) {
                return airports.slice(-count)
            }
            return airports
        } else {
            return []
        }
    }

    static airportRecentsUpdate(code: string) {
        const promise = new Promise((resolve) => {
            let recentAirports = localStorage.getItem(LocalStoreService.recentAirports)
            if (recentAirports) {
                const recentList = recentAirports.split('-')
                if (recentList.includes(code)) {
                    // move to end of list
                    recentList.splice(recentList.indexOf(code), 1)
                }
                recentList.push(code)
                recentAirports = recentList.join('-')
            } else {
                recentAirports = code
            }
            // save the new list
            localStorage.setItem(LocalStoreService.recentAirports, recentAirports)
            LocalStoreService.notify()
            resolve(true)
        })
    }

    static airportRemove(code: string) {
        localStorage.removeItem(LocalStoreService.airportPrefix + code)
        LocalStoreService.notify()
    }

    static airportRemoveAll() {
        const keys = Object.keys(localStorage)
        for (const key of keys) {
            if (key.startsWith(LocalStoreService.airportPrefix)) {
                localStorage.removeItem(key)
            }
        }
        localStorage.removeItem(LocalStoreService.recentAirports)
        LocalStoreService.notify()
    }

    static approachCleanUp() {
        const item = localStorage.getItem(this.recentApproaches)
        if (!item) return;
        const approaches = item.split('-')
        let cleanUp = 0
        while (approaches.length > this.MAX_APPROACHES) {
            // remove first element
            const apch = approaches.shift()
            localStorage.removeItem(this.approachPrefix + apch)
            // console.debug('[LocalStoreService.approachCleanUp] removing ' + apch)
            cleanUp++;
        }
        if (cleanUp) {
            // console.log('[LocalStoreService.approachCleanUp] removed ' + cleanUp)
            localStorage.setItem(this.recentApproaches, approaches.join('-'))
        }
    }

    static cleanUp(): Promise<boolean> {
        return new Promise(resolve => {
            // try old template
            let templateData = localStorage.getItem(LocalStoreService.templateOld)
            if (templateData) {
                if (!localStorage.getItem(LocalStoreService.template)) {
                    // Save under new name and remove old entry
                    const template = JSON.parse(templateData)
                    LocalStoreService.saveTemplate(template)
                    return template
                }
                // remove old stuff
                console.log('[LocalStoreService.cleanUp] removing ' + LocalStoreService.templateOld)
                localStorage.removeItem(LocalStoreService.templateOld)
            }

            // Try older name
            templateData = localStorage.getItem(LocalStoreService.templateOlder)
            if (templateData) {
                if (!localStorage.getItem(LocalStoreService.template)) {
                    // create a local sheet with no name
                    const template = { data: JSON.parse(templateData) }
                    // Save under new name and remove old entry
                    LocalStoreService.saveTemplate(template)
                }
                // remove old stuff
                console.log('[LocalStoreService.cleanUp] removing ' + LocalStoreService.templateOlder)
                localStorage.removeItem(LocalStoreService.templateOlder)
            }

            // old user
            const oldUser = localStorage.getItem(LocalStoreService.userOld)
            if (oldUser) {
                // migrate to new user if not already done
                if (!localStorage.getItem(LocalStoreService.user)) {
                    localStorage.setItem(LocalStoreService.user, oldUser)
                }
                console.log('[LocalStoreService.cleanUp] removing ' + LocalStoreService.userOld)
                localStorage.removeItem(LocalStoreService.userOld)
            }

            LocalStoreService.airportCleanUp()
            LocalStoreService.approachCleanUp()
            LocalStoreService.thumbnailCleanUp()
            LocalStoreService.notamsCleanUp()

            resolve(true)
        })
    }

    static getApproachPlate(pdfFile: string): string | null {
        const key = this.approachPrefix + pdfFile
        return localStorage.getItem(key)
    }

    // Load active sheet from localstorage
    static getTemplate(): Template {
        let stringData = localStorage.getItem(LocalStoreService.template)
        // Vanilla scenario
        if (stringData) return Template.parse(JSON.parse(stringData))

        // Nothing worked
        return Template.noTemplate();
    }

    // return active user
    static getUser(): User | undefined {
        const userString = localStorage.getItem(LocalStoreService.user)
        if (userString) {
            return JSON.parse(userString)
        }
        return undefined;
    }

    /**
     * Should we show a specific popup
     * The three stages for 'popup' are null / 1 / 2
     * @returns true if we should show or false otherwise
     */
    static popupShow(id: number): boolean {
        const popup = localStorage.getItem(LocalStoreService.popup);

        return popup ? Number(popup) < id : true;
    }

    static notamsAdd(airportCode: string, notams: Notam[]) {
        // create a notam key for this airport
        const key = LocalStoreService.notamsPrefix + airportCode
        // create a payload with current time and notam data
        const payload = {
            timestamp: new Date().toISOString(),
            notams: notams
        }
        // save the notams
        localStorage.setItem(key, JSON.stringify(payload))
    }

    static notamsCleanUp() {
        const cleanUpTime = new Date().getTime() - MAX_NOTAMS_AGE
        const cleanUpList: string[] = []
        // look for all notams entries
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(LocalStoreService.notamsPrefix)) {
                // remove the item if time is more than 6 hours
                const payload = JSON.parse(localStorage.getItem(key) || '{}')
                if (payload.timestamp && new Date(payload.timestamp).getTime() < cleanUpTime) {
                    cleanUpList.push(key)
                }
            }
        }
        cleanUpList.forEach(key => {
            localStorage.removeItem(key)
        })
        // console.log('[LocalStoreService.notamsCleanUp] removed ' + cleanUpList.length + ' notams')
    }

    static notamsGet(airportCode: string): Notam[] {
        const key = LocalStoreService.notamsPrefix + airportCode
        const payload = JSON.parse(localStorage.getItem(key) || '{}')
        const isCurrent = payload && payload.timestamp && new Date(payload.timestamp).getTime() > new Date().getTime() - MAX_NOTAMS_AGE
        if (!payload || !isCurrent) return []
        return payload.notams
    }

    /**
     * Stop further showing how does it work by setting the flag in local store
     */
    static popupHide(id: number = 0) {
        localStorage.removeItem(LocalStoreService.howDoesItWork_deprecated)
        localStorage.setItem(LocalStoreService.popup, id.toString())
    }



    static saveApproachPlate(pdfFile: string, plate: string) {
        const key = this.approachPrefix + pdfFile
        localStorage.setItem(key, plate)
        const approaches = localStorage.getItem(this.recentApproaches)
        // add this file to the end
        const newApproaches = approaches ? (approaches + '-' + pdfFile) : pdfFile
        localStorage.setItem(this.recentApproaches, newApproaches)
        this.approachCleanUp()
    }

    static saveTemplate(data: any) {
        localStorage.setItem(LocalStoreService.template, JSON.stringify(data))
    }

    static saveTemplateById(id: number, template: Template) {
        localStorage.setItem(LocalStoreService.templatePrefix + id, JSON.stringify(template))
    }

    static getTemplateById(id: number): Template | undefined {
        const stringData = localStorage.getItem(LocalStoreService.templatePrefix + id)
        if (stringData) return Template.parse(JSON.parse(stringData))
        return undefined
    }

    static templateCount(): number {
        return Object.keys(localStorage).filter(key => key.startsWith(LocalStoreService.templatePrefix) && !isNaN(Number(key.substring(LocalStoreService.templatePrefix.length)))).length
    }

    static templateRemoveAll() {
        const keys = Object.keys(localStorage)
        for (const key of keys) {
            // Check if key starts with prefix and followed by a number
            if (key.startsWith(LocalStoreService.templatePrefix) && !isNaN(Number(key.substring(LocalStoreService.templatePrefix.length)))) {
                localStorage.removeItem(key)
            }
        }
        LocalStoreService.notify()
    }

    /**
     * Remove thumbnails that do not belong to this user
     */
    static thumbnailCleanUp() {
        const user: User | undefined = LocalStoreService.getUser()
        if (!user) return;
        // build a list of know user ids
        const idList = user.templates.map(t => String(t.id))
        // console.log('[LocalStoreService.thumbnailCleanUp] id list', idList)
        const thumbList = Object.keys(localStorage)
            .filter((key: string) => key.startsWith(LocalStoreService.thumbnailPrefix))
            .map((key: string) => key.substring(LocalStoreService.thumbnailPrefix.length))
        // console.log('[LocalStoreService.thumbnailCleanUp] thumb list', thumbList)
        const deadThumb = thumbList.filter(key => !idList.includes(key) && key != 'local')
        // console.log('[LocalStoreService.thumbnailCleanUp] dead thumbs', deadThumb)
        for (const dt of deadThumb) {
            localStorage.removeItem(LocalStoreService.thumbnailPrefix + dt)
            console.log('[LocalStoreService.thumbnailCleanUp] removing ' + dt)
        }
    }

    /**
     * Retrieve thumbnail data 
     * @param id template id
     */
    static thumbnailGet(id: number) {
        return localStorage.getItem(LocalStoreService.thumbnailPrefix + id)
    }

    static thumbnailSave(id: number, data: any) {
        localStorage.setItem(LocalStoreService.thumbnailPrefix + id, data)
    }

}