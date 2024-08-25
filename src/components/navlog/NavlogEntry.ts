export class NavlogEntry {
    name: string;
    alt: number|undefined; // Altitude
    th: number; // True heading
    ch: number; // Compass Heading
    wca: number; // wind correction angle
    ld: number; // leg distance
    gs: number; // ground speed
    lt: number; // let time
    fr: number; // fuel remaining
    lf: number; // leg fuel
    att: string|undefined; // attitude

    constructor(name:string, atltitude:number|undefined=undefined) {
        this.name = name;
        this.alt = atltitude;
        this.lt = 0;
    }
    static copy(source:any):NavlogEntry {
        if(!source) return new NavlogEntry('');
        const output:NavlogEntry = new NavlogEntry(source.name, source.alt);
        output.th = source.th;
        output.ch = source.ch;
        output.wca = source.wca;
        output.ld = source.ld;
        output.gs = source.gs;
        output.lt = source.lt;
        output.fr = source.fr;
        output.lf = source.lf;
        output.att = source.att;
        return output;
    }
    public getLegDistance():number {
        return this.ld;
    }
    public getLegTime():number {
        return this.lt ? this.lt : 0;
    }
    public getLegFuel() {
        return this.lf;
    }
}