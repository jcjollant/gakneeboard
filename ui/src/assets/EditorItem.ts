import { NavlogEntry } from "./NavlogEntry"

export class EditorItem {
    entry:NavlogEntry
    canDelete:boolean
    canAdd:boolean
    attitudeClass:string

    constructor(entry:NavlogEntry, canDelete:boolean=true, canAdd:boolean=true, attClass:string='') {
        this.entry = entry
        this.canDelete = canDelete
        this.canAdd = canAdd
        this.attitudeClass = attClass
    }

    // create a boundary item with its airport code, elevation and cannot be deleted
    public static boundary(airport:any, canAdd:boolean=true) {
        return new EditorItem(new NavlogEntry(airport.code, airport.elev), false, canAdd, '')
    }

    // first entry cannot be deleted, can be amended
    public static first(name:string, elevation:number, attClass:string='') {
        return new EditorItem(new NavlogEntry(name, elevation), false, true, attClass)
    }

    // a vanilla item only has a name and can be deleted
    public static leg(name:string,elevation:number|undefined=undefined,attClass:string='') {
        return new EditorItem(new NavlogEntry(name,elevation), true, true, attClass)
    }

    public static last(name:string, elevation:number) {
        return new EditorItem(new NavlogEntry(name, elevation), false, false)
    }

    public static naked(name:string, attClass:string='') {
        return new EditorItem(new NavlogEntry(name), true, true, attClass)
    }
}