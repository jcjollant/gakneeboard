import { NavlogEntry } from "./NavlogEntry";

export class Navlog {
    from:string
    to:string
    ff:number // Initial fuel (Fuel From)
    ft:number // Fuel at destination (Fuel To)
    mv:number // magnetic variation
    md:number // magnetic deviation
    tt:number // Total Time
    td:number // Total Distance
    entries:NavlogEntry[]

    constructor(from:string,to:string) {
        this.from = from;
        this.to = to;
        this.tt = 0;
        this.td = 0;
        this.entries = []
    }

    static copy(source:any):Navlog {
        if(!source) return new Navlog('', '')
        const output:Navlog = new Navlog(source.from, source.to)
        output.ff = source.ff
        output.ft = source.ft
        output.mv = source.mv
        output.md = source.md
        output.tt = source.tt
        output.td = source.td
        output.entries = source.entries?.map((entry:any) => NavlogEntry.copy(entry))
        return output;
    }

    // computed a compass heading based off navlog settings and leg true heading
    getEntryCompassHeading(entry:NavlogEntry):number|undefined {
        return (entry.th) ? (entry.th + this.mv + this.md) : undefined
    }

    updateRelationships() {
        // calculate total time and distance
        // based on leg times and distances
        this.td = 0;
        this.tt = 0;
        this.ft = this.ff;

        const entriesCount = this.entries.length;

        // we count all legs except last checkpoint which doesn't have a leg
        for(let index = 0; index < entriesCount -1; index++) {
            const entry:NavlogEntry = this.entries[index]

            // update totals
            this.td += entry.getLegDistance()
            this.tt += entry.getLegTime()

            // fuel
            entry.fr = this.ft;
            this.ft -= entry.getLegFuel()

            // update compass headings
            entry.ch = this.getEntryCompassHeading(entry)

            // attitudes
            const nextEntry = (index < entriesCount - 1) ? this.entries[index+1] : undefined;
            // attitude is set to neutral (undefined) if altitudes are unknown or equal
            if( nextEntry == undefined 
                || entry.alt === undefined 
                || nextEntry.alt === undefined 
                || entry.alt == nextEntry.alt) {
                entry.att = undefined;
            } else if( entry.alt < nextEntry.alt) {
                entry.att = '+'
            } else {
                entry.att = '-'
            }
        }
    }

    // refresh Navlog entries and recompute totals
    setEntries(entries:NavlogEntry[]) {
        this.entries = entries
        this.updateRelationships()
    }

}