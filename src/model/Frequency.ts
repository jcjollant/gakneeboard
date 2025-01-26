export class Frequency {
    mhz:number;
    name:string;
    constructor(mhz:number, name:string) {
        this.mhz = mhz;
        this.name = name;
    }
    static copy(freq:Frequency):Frequency {
        return new Frequency(Number(freq.mhz), freq.name)
    }
}