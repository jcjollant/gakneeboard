

export class SessionAirports {

    data:any
    listeners:any

    constructor() {
        this.data = {}
        this.listeners = []
    }

    addListener(listener:any) {
        if( this.listeners.includes(listener)) return
        this.listeners.push(listener)
        listener(this.buildList())
    }

    buildList() {
        return Object.keys(this.data).map( k => this.data[k])
    }

    // remove unknowns from active list
    cleanUp() {
        for( const code in this.data) {
            if( this.data[code] == null) {
                delete this.data[code]
            }
        }
    }

    get(code:string) {
        return this.data[code]
    }

    notify() {
        // create an array of airports
        const airportsArray = this.buildList();
        for(const listener of this.listeners) {
            listener(airportsArray)
        }
    }


    set(code:string, airport:any) {
        this.data[code] = airport
        // tell everyone
        this.notify()
    }

    // add a code as invalid
    setInvalid(code:string) {
        this.data[code] = null
    }
}
