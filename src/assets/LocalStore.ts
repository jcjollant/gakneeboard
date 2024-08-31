export class LocalStore {
    static user:string = 'user'
    static userOld:string = 'kb-user'
    static howDoesItWork:string = 'howDoesItWork'
    static template = 'template'
    static templateOld = 'sheet'
    static templateOlder = 'page1'


    // Load active sheet from localstorage
    static getTemplate() {
        let stringData = localStorage.getItem(LocalStore.template)
        // Vanilla scenario
        if( stringData) return JSON.parse(stringData)

        // try old name
        stringData = localStorage.getItem(LocalStore.templateOld)  
        if( stringData) {
            console.log('[LocalStore.getTemplate] found under', LocalStore.templateOld)
            // Save under new name and remove old entry
            const template = JSON.parse(stringData)
            LocalStore.saveTemplate(template)
            localStorage.removeItem(LocalStore.templateOld)
            return template
        }
        
        // Try older name
        stringData = localStorage.getItem(LocalStore.templateOlder)
        if( stringData) {
            // create a local sheet with no name
            const template = {data:JSON.parse(stringData)}
            // Save under new name and remove old entry
            LocalStore.saveTemplate(template)
            localStorage.removeItem(LocalStore.templateOlder)
            return template;
        }

        // Nothing worked
        return null;
    }


    /**
     * Should we show how does it work
     * @returns true if we should show or false otherwise
     */
    static showHowDoesItWork():boolean {
        return localStorage.getItem( LocalStore.howDoesItWork) != 'false'    
    }

    // Save sheet data to browser
    static saveTemplate( data:any,modified=false) {
        if(data) data.modified = modified;
        localStorage.setItem(LocalStore.template, JSON.stringify( data))
    }

    /**
     * Stop further showing how does it work by setting the flag in local store
     */
    static stopHowDoesItWork() {
        localStorage.setItem( LocalStore.howDoesItWork, "false")
    }
}