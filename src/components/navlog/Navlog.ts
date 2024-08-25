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

    calculateTotals() {
        // calculate total time and distance
        // based on leg times and distances
        this.td = 0;
        this.tt = 0;
        this.ft = this.ff;
        for(const entry of this.entries) {
            this.td += entry.getLegDistance()
            this.tt += entry.getLegTime()
            this.ft -= entry.getLegFuel()
        }
    }

    // refresh Navlog entries and recompute totals
    setEntries(entries:NavlogEntry[]) {
        this.entries = entries
        this.calculateTotals()
    }

}