import { NavlogEntry } from "./NavlogEntry"

export class NavlogItem {
    entry:NavlogEntry
    canDelete:boolean
    canAdd:boolean

    constructor(entry:NavlogEntry, canDelete:boolean=true, canAdd:boolean=true) {
        this.entry = entry
        this.canDelete = canDelete
        this.canAdd = canAdd
    }

    // create a boundary item with its airport code, elevation and cannot be deleted
    public static boundary(airport:any, canAdd:boolean=true) {
        return new NavlogItem(new NavlogEntry(airport.code, airport.elev), false, canAdd)
    }

    // a vanilla item only has a name and can be deleted
    public static vanila(name:string) {
        return new NavlogItem(new NavlogEntry(name))
    }
}