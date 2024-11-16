import { DiagramData } from "./DiagramData"

export class LocalStore {
    static airportPrefix:string = 'airport-'
    static approachPrefix:string = 'apch-'
    static user:string = 'user'
    static userOld:string = 'kb-user'
    static howDoesItWork:string = 'howDoesItWork'
    static recentAirports:string = 'airports'
    static recentApproaches:string = 'approaches'
    static template = 'template'
    static templateOld = 'sheet'
    static templateOlder = 'page1'
    static MAX_AIRPORTS = 15
    static MAX_APPROACHES = 5
    static LEAN_AIRPORTS = 10

    static airportAdd(code:string, airport:any) {
        if(!airport) return;
        localStorage.setItem(LocalStore.airportPrefix + airport.code, JSON.stringify(airport))
        LocalStore.airportUpdateRecents(code)
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

    static airportGet(code:string) {
        const airport = localStorage.getItem( LocalStore.airportPrefix + code)
        if( airport) {
            LocalStore.airportUpdateRecents(code)
        }
        return airport
    }

    static airportRemove(code:string) {
        localStorage.removeItem(LocalStore.airportPrefix + code)
    }

    static airportUpdateRecents(code:string) {
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
            resolve(true)
        })
    }

    static getApproachPlate(pdfFile:string):string|null {
        const key = this.approachPrefix + pdfFile
        return localStorage.getItem(key)
    }

    // Load active sheet from localstorage
    static getTemplate() {
        let stringData = localStorage.getItem(LocalStore.template)
        // Vanilla scenario
        if( stringData) return JSON.parse(stringData)

        // Nothing worked
        return null;
    }

    // return active user
    static getUser() {
      return localStorage.getItem(LocalStore.user);
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
    static saveTemplate( data:any,modified=false) {
        if(data) data.modified = modified;
        localStorage.setItem(LocalStore.template, JSON.stringify( data))
    }

    /**
     * Should we show how does it work
     * @returns true if we should show or false otherwise
     */
    static showHowDoesItWork():boolean {
        return localStorage.getItem( LocalStore.howDoesItWork) != 'false'    
    }

    /**
     * Stop further showing how does it work by setting the flag in local store
     */
    static stopHowDoesItWork() {
        localStorage.setItem( LocalStore.howDoesItWork, "false")
    }
}