export class NavlogEntry {
    name: string;
    alt: number|undefined; // Altitude
    att: string|undefined; // attitude
    tc: number|undefined; // True Course
    wind: string|undefined; // Wind
    tas: number|undefined; // True Airspeed
    th: number|undefined; // True Heading
    mh: number|undefined; // Magnetic Heading
    ch: number|undefined; // Compass Heading
    ld: number|undefined; // leg distance
    gs: number|undefined; // ground speed
    lt: number|undefined; // let time
    fr: number|undefined; // fuel remaining
    lf: number|undefined; // leg fuel
    mv: number|undefined; // magnetic variation
    md: number|undefined; // magnetic deviation
    mc: number|undefined; // magnetic course

    constructor(name:string, atltitude:number|undefined=undefined) {
        this.name = name;
        this.alt = atltitude;
        this.tc = undefined;
        this.wind = undefined;
        this.th = undefined;
        this.ch = undefined; // needs to be calculated from other values
        this.ld = undefined;
        this.gs = undefined;
        this.lt = undefined;
        this.fr = undefined;
        this.lf = undefined;
        this.att = undefined;
        this.tas = undefined;
        this.mh = undefined;
        this.md = undefined;
        this.mc = undefined;
    }
    
    // Copy all fields from a source to a new NavlogEntry
    static copy(source:any):NavlogEntry {
        if(!source) return new NavlogEntry('');
        const output:NavlogEntry = new NavlogEntry(source.name, source.alt);
        const fields = ['tc','wind','th','mh','ch','ld','gs','lt','fr','lf','att','tas','md','mv', 'mc']
        for(const field of fields) {
            if(source[field] !== undefined) output[field] = source[field];
        }
        return output;
    }
    public getLegDistance():number {
        return this.ld ? this.ld : 0;
    }
    public getLegTime():number {
        return this.lt ? this.lt : 0;
    }
    public getLegFuel() {
        return this.lf ? this.lf : 0;
    }
    public getWind():[number,number] {
        if(!this.wind) return [0,0];
        const [direction,speed] = this.wind.split('@')
        return [Number(direction),Number(speed)];
    }
    public setWind(direction:number,speed:number) {
        this.wind = `${direction}@${speed}`;
    }
}