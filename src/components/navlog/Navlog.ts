import { visitAndCloseBanner } from "../../../cypress/e2e/shared";
import { NavlogEntry } from "./NavlogEntry";

export class Navlog {
    from:string
    to:string
    ff:number // Initial fuel (Fuel From)
    ft:number // Fuel at destination (Fuel To)
    mv:number|undefined // magnetic variation
    md:number|undefined // magnetic deviation
    tt:number // Total Time
    td:number // Total Distance
    entries:NavlogEntry[]

    constructor(from:string,to:string) {
        this.from = from;
        this.to = to;
        this.ff = 0;
        this.ft = 0;
        this.md = undefined;
        this.mv = undefined;
        this.tt = 0;
        this.td = 0;
        this.entries = []
    }

    static copy(source:any):Navlog {
        if(!source) return new Navlog('', '')
        const output:Navlog = new Navlog(source.from, source.to)
        output.ff = Number(source.ff)
        output.ft = Number(source.ft)
        output.mv = Number(source.mv)
        output.md = Number(source.md)
        output.tt = Number(source.tt)
        output.td = Number(source.td)
        output.entries = source.entries?.map((entry:any) => NavlogEntry.copy(entry))
        return output;
    }

    // computed a compass heading based off navlog settings and leg true heading
    getEntryCompassHeading(entry:NavlogEntry):number|undefined {
        const variation = Number(this.mv ? this.mv : 0);
        const deviation = Number(this.md ? this.md : 0);
        return (entry.th) ? (entry.th + variation + deviation) : undefined
    }

    getFuelFrom():number {
        return this.ff;
    }

    getMagneticDeviation():number|undefined {
        return this.md;
    }

    getMagneticVariation():number|undefined {
        return this.mv;
    }

    // refresh Navlog entries and recompute totals
    setEntries(entries:NavlogEntry[]) {
        this.entries = entries
        this.updateRelationships()
    }

    setFuelFrom(value:any) {
        this.ff = Number(value)
    }

    setFuelTo(value:any) {
        this.ft = Number(value)
    }

    setMagneticDeviation(value:any) {
        if( value == '') {
            this.md = undefined
        } else {
            this.md = Number(value)
        }
    }

    setMagneticVariation(value:any) {
        if( value == '') {
            this.mv = undefined
        } else {
            this.mv = Number(value)
        }
    }

    setTotalDistance(value:any) {
        this.td = Number(value)
    }

    setTotalTime(value:any) {
        this.tt = Number(value)
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

}