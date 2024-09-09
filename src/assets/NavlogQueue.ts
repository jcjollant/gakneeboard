import { Navlog } from './Navlog'


export class NavlogQueue {
    navlogListeners:any
    lastNavlog:Navlog|undefined

    constructor() {
        this.navlogListeners = []
        this.lastNavlog = undefined
    }

    addListener(listener:any):Navlog|undefined {
        if( this.navlogListeners.includes(listener) ) return this.lastNavlog
        this.navlogListeners.push(listener)
        return this.lastNavlog
    }

    notify(navlog:any) {
        this.lastNavlog = navlog
        // console.log('[CurrentUser.update] notifying listeners', this.listenners.length)
        for(const listener of this.navlogListeners) {
            listener(navlog)
        }
    }
}
