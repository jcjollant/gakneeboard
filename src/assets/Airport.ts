const modelVersion:number = 6;

class Frequency {
    name: string;
    mhz: number;
    constructor(name:string, frequency:number) {
        this.name = name;
        this.mhz = frequency;
    }
}

export class RunwayEnd {
    name: string;
    mag: number;
    tp: string; 
    /**
     * @param name This runway end name, should start with RP if this is a Right pattern 
     * @param orientation Magnetic orientation of the runway
     */
    constructor(name:string, orientation:number) {
        if( name.startsWith('RP')) {
            this.tp = Runway.rightPattern
            this.name = name.substring(2);
        } else {
            this.tp = Runway.leftPattern
            this.name = name;
        }
        this.mag = orientation;
    }
    // public getPattern():string {
    //     return this.tp;
    // }
}

export class Runway {
    name: string;
    length: number;
    width: number;
    ends: RunwayEnd[];
    public static rightPattern:string = 'R';
    public static leftPattern:string = 'L';

    constructor(name:string, length:number, width:number) {
        this.name = name;
        this.length = length;
        this.width = width;
        const ends:string[]  = name.split('-')
        this.ends = []
        this.ends.push( ...ends.map( (end) =>  new RunwayEnd(end, parseInt(end)*10) ) ); 
    }
    public getEnd(name:string):RunwayEnd|undefined {
        return this.ends.find((end) => end.name === name)
    }

    public getOrientation(end:string):number|undefined {
        const rwyEnd:RunwayEnd|undefined = this.getEnd(end)
        if (rwyEnd) {
            return rwyEnd.mag
        }
        return undefined
    }
    public getTrafficPattern(end:string):string|undefined {
        const rwyEnd:RunwayEnd|undefined = this.getEnd(end)
        if (rwyEnd) {
            return rwyEnd.tp
        }
        return undefined
    }
    public setTrafficPattern(end:string, pattern:string) {
        const rwyEnd:RunwayEnd|undefined = this.getEnd(end)
        if (rwyEnd && (pattern == Runway.rightPattern || pattern == Runway.leftPattern)) {
            rwyEnd.tp = pattern
        }
    }

    static isValidEndName(name:string):boolean {
        // catch too short and too long runway names 
        if (name.length < 2 || name.length > 3) return false

        if( name.length == 3) {
            const position:string = name.charAt(2)
            // position must be L, R or C
            if( position != 'L' && position != 'R' && position != 'C') return false
        }

        // validate runway number
        const number:number = parseInt(name.substring(0,2))

        return number > 0 && number < 37
    }
    // this method checks wether a runway name is valid
    public static isValidName(name:string):boolean {
        const ends:string[]  = name.split('-')
        // we need exactly 2 runway ends
        if (ends.length != 2) return false
        // both ends must be valid
        return Runway.isValidEndName(ends[0]) && Runway.isValidEndName(ends[1])
    }

}

export class Airport {
    static currentVersion:number = modelVersion;
    code: string;
    name: string;
    elev: number;
    freq: Frequency[];
    rwys: Runway[];
    version:number;

    constructor(code, name, elevation) {
        this.code = code;
        this.name = name;
        this.elev = elevation;
        this.freq = [];
        this.rwys = [];
        this.version = modelVersion;
    }

    public static isValidCode(code:string):boolean {
        return code.length == 3 || code.length == 4
    }

    addFrequency(name:string, mhz:number) {
        this.freq.push(new Frequency(name,mhz));
    }

    /**
     * Add a single runway to the airport
     * @param runway 
     */
    addRunway(runway:Runway) {
        this.rwys.push(runway);
    }

    /**
     * Add multiple runways to the airport
     * @param runways 
     */
    addRunways(runways:Runway[]) {
        this.rwys.push(...runways);
    }
}