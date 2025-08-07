import { Airport } from '../model/Airport'
import { User } from "../model/User"
import { Template } from "../model/Template"

export class LocalStore {
    static airportPrefix:string = 'airport-'
    static approachPrefix:string = 'apch-'
    static user:string = 'user'
    static userOld:string = 'kb-user'
    static howDoesItWork_deprecated:string = 'howDoesItWork'
    static popup:string = 'popup'
    static recentAirports:string = 'airports'
    static recentApproaches:string = 'approaches'
    static template = 'template'
    static templateOld = 'sheet'
    static templateOlder = 'page1'
    static thumbnailPrefix = 'tthumb-'
    static MAX_AIRPORTS = 30
    static MAX_APPROACHES = 5
    static LEAN_AIRPORTS = 24

    static airportAdd(code:string, airport:any) {
        if(!airport) return;
        localStorage.setItem(LocalStore.airportPrefix + airport.code, JSON.stringify(airport))
        LocalStore.airportRecentsUpdate(code)
    }

    static airportCleanUp() {
        // clean up airports cache above threshold
        const airportList = localStorage.getItem(LocalStore.recentAirports)
        if( airportList) {
            const airportCodes = airportList.split('-')
            if(airportCodes.length > LocalStore.MAX_AIRPORTS) {
                // reduce recent list to lean size
                airportCodes.splice(0, airportCodes.length - LocalStore.LEAN_AIRPORTS)
                for(var key in localStorage) {
                    // console.log('[LocalStore.cleanup] key ' + key)
                    if(key.startsWith(LocalStore.airportPrefix)) {
                        const code = key.substring(LocalStore.airportPrefix.length)
                        if(airportCodes.indexOf(code) < 0) {
                            console.log('[LocalStore.cleanUp] removing', key)
                            localStorage.removeItem(key)
                        }
                    }
                }

                // replace recent list with most recent
                const newRecentAirport = airportCodes.join('-')
                console.log('[LocalStore.cleanUp] new recent airports', newRecentAirport)
                localStorage.setItem(LocalStore.recentAirports, newRecentAirport)
            }
        }
    }

    /**
     * Finds an airport by code in the local store
     * @param code Airport code
     * @returns 
     */

    static airportGet(code:string):Airport {
        const storeAirport = localStorage.getItem( LocalStore.airportPrefix + code)
        if( storeAirport) {
            LocalStore.airportRecentsUpdate(code)
            return Airport.copy(JSON.parse(storeAirport))
        } else {
            // Throw new error
            throw new Error('Airport ' + code + ' not found in local store')
        }
    }

    static airportRecentsGet():string[] {
        let recentAirports = localStorage.getItem(LocalStore.recentAirports)
        if(recentAirports) {
            return recentAirports.split('-')
        } else {
            return []
        }
    }

    static airportRecentsUpdate(code:string) {
        const promise = new Promise((resolve) => {
            let recentAirports = localStorage.getItem(LocalStore.recentAirports)
            if(recentAirports) {
                const recentList = recentAirports.split('-')
                if(recentList.includes(code)) {
                    // move to end of list
                    recentList.splice(recentList.indexOf(code), 1)
                }
                recentList.push(code)
                recentAirports = recentList.join('-')
            } else {
                recentAirports = code
            }
            // save the new list
            localStorage.setItem(LocalStore.recentAirports, recentAirports)
            resolve(true)
        })
    }

    static airportRemove(code:string) {
        localStorage.removeItem(LocalStore.airportPrefix + code)
    }

    static approachCleanUp() {
        const item = localStorage.getItem(this.recentApproaches)
        if(!item) return;
        const approaches = item.split('-')
        let cleanUp = 0
        while( approaches.length > this.MAX_APPROACHES) {
            // remove first element
            const apch = approaches.shift()
            localStorage.removeItem(this.approachPrefix + apch)
            console.log('[LocalStore.approachCleanUp] removing ' + apch)
            cleanUp++;
        }
        if(cleanUp) {
            // console.log('[LocalStore.approachCleanUp] removed ' + cleanUp)
            localStorage.setItem(this.recentApproaches, approaches.join('-'))
        }
    }

    static cleanUp():Promise<boolean> {
        return new Promise(resolve => {
            // try old template
            let templateData = localStorage.getItem(LocalStore.templateOld)  
            if( templateData) {
                if( !localStorage.getItem(LocalStore.template)) { 
                    // Save under new name and remove old entry
                    const template = JSON.parse(templateData)
                    LocalStore.saveTemplate(template)
                    return template
                }
                // remove old stuff
                console.log('[LocalStore.cleanUp] removing ' + LocalStore.templateOld)
                localStorage.removeItem(LocalStore.templateOld)
            }
        
            // Try older name
            templateData = localStorage.getItem(LocalStore.templateOlder)
            if( templateData) {
                if( !localStorage.getItem(LocalStore.template)) { 
                    // create a local sheet with no name
                    const template = {data:JSON.parse(templateData)}
                    // Save under new name and remove old entry
                    LocalStore.saveTemplate(template)
                }
                // remove old stuff
                console.log('[LocalStore.cleanUp] removing ' + LocalStore.templateOlder)
                localStorage.removeItem(LocalStore.templateOlder)
            }

            // old user
            const oldUser = localStorage.getItem(LocalStore.userOld)
            if(oldUser) {
                // migrate to new user if not already done
                if(!localStorage.getItem(LocalStore.user)) {
                    localStorage.setItem(LocalStore.user, oldUser)
                }
                console.log('[LocalStore.cleanUp] removing ' + LocalStore.userOld)
                localStorage.removeItem(LocalStore.userOld)
            }

            LocalStore.airportCleanUp()
            LocalStore.approachCleanUp()
            LocalStore.thumbnailCleanUp()

            resolve(true)
        })
    }

    static getApproachPlate(pdfFile:string):string|null {
        const key = this.approachPrefix + pdfFile
        return localStorage.getItem(key)
    }

    // Load active sheet from localstorage
    static getTemplate():Template {
        let stringData = localStorage.getItem(LocalStore.template)
        // Vanilla scenario
        if( stringData) return Template.parse(JSON.parse(stringData))

        // Nothing worked
        return Template.noTemplate();
    }

    // return active user
    static getUser():User|undefined {
        const userString = localStorage.getItem(LocalStore.user)
        if(userString) {
            return JSON.parse(userString)
        }
        return undefined;
    }

    /**
     * Should we show a specific popup
     * The three stages for 'popup' are null / 1 / 2
     * @returns true if we should show or false otherwise
     */
    static popupShow(id:number):boolean {
        const popup = localStorage.getItem( LocalStore.popup);

        return popup ? Number(popup) < id : true;
    }

    /**
     * Stop further showing how does it work by setting the flag in local store
     */
    static popupHide(id:number=0) {
        localStorage.removeItem(LocalStore.howDoesItWork_deprecated)
        localStorage.setItem(LocalStore.popup, id.toString())
    }



    static saveApproachPlate(pdfFile:string, plate:string) {
        const key = this.approachPrefix + pdfFile
        localStorage.setItem(key, plate)
        const approaches = localStorage.getItem(this.recentApproaches)
        // add this file to the end
        const newApproaches = approaches ? (approaches + '-' + pdfFile) : pdfFile
        localStorage.setItem(this.recentApproaches, newApproaches)
        this.approachCleanUp()
    }

    // Save sheet data to browser
    static saveTemplate( data:any) {
        localStorage.setItem(LocalStore.template, JSON.stringify( data))
    }

    /**
     * Remove thumbnails that do not belong to this user
     */
    static thumbnailCleanUp() {
        const user:User|undefined = LocalStore.getUser()
        if(!user) return;
        // build a list of know user ids
        const idList = user.templates.map( t => String(t.id))
        // console.log('[LocalStore.thumbnailCleanUp] id list', idList)
        const thumbList = Object.keys(localStorage)
            .filter( (key:string) => key.startsWith(LocalStore.thumbnailPrefix))
            .map( (key:string) => key.substring(LocalStore.thumbnailPrefix.length))
        // console.log('[LocalStore.thumbnailCleanUp] thumb list', thumbList)
        const deadThumb = thumbList.filter( key => !idList.includes(key) && key != 'local')
        // console.log('[LocalStore.thumbnailCleanUp] dead thumbs', deadThumb)
        for(const dt of deadThumb) {
            localStorage.removeItem(LocalStore.thumbnailPrefix + dt)
            console.log('[LocalStore.thumbnailCleanUp] removing ' + dt)
        }
    }

    /**
     * Retrieve thumbnail data 
     * @param id template id
     */
    static thumbnailGet(id:number) {
        return localStorage.getItem(LocalStore.thumbnailPrefix + id)
    }

    static thumbnailSave( id:number, data:any) {
        localStorage.setItem(LocalStore.thumbnailPrefix + id, data)
    }

}