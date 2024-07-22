const modelVersion:number = 7;
export const versionInvalid:number = -1

export class Frequency {
    name: string;
    mhz: number;
    constructor(name:string, frequency:number) {
        this.name = name;
        this.mhz = frequency;
    }
}

export enum PatternDirection {
    Left = 'L',
    Right = 'R'
}

export class RunwayEnd {
    name: string;
    mag: number;
    tp: PatternDirection; 
    /**
     * @param name This runway end name, should start with RP if this is a Right pattern 
     * @param orientation Magnetic orientation of the runway
     */
    constructor(name:string, orientation:number) {
        if( name.startsWith('RP')) {
            this.tp = PatternDirection.Right
            this.name = name.substring(2);
        } else {
            this.tp = PatternDirection.Left
            this.name = name;
        }
        this.mag = orientation % 360;
        // this.setMagneticOrientation(orientation);
    }

    setMagneticOrientation(value:number) {
        this.mag = value % 360;
    }

    setTrafficPattern(direction:PatternDirection) {
        this.tp = direction
    }
}

export class RunwaySurface {
    type:string;
    cond:string;
    constructor(type:string, condition:string) {
        this.type = type;
        this.cond = condition;
    }
}

export class Runway {
    name: string;
    length: number;
    width: number;
    ends: RunwayEnd[];
    surface: RunwaySurface|undefined;
    freq: number|undefined;
    // public static rightPattern:string = 'R';
    // public static leftPattern:string = 'L';

    constructor(name:string, length:number, width:number) {
        this.name = name;
        this.length = length;
        this.width = width;
        const ends:string[]  = name.split('-')
        this.ends = []
        this.ends.push( ...ends.map( (end) =>  new RunwayEnd(end, parseInt(end)*10) ) ); 
        this.freq = undefined
        this.surface = undefined
    }
    public getEnd(name:string):RunwayEnd|undefined {
        return this.ends.find((end) => end.name === name)
    }

    public getEndsName():string[] {
        return this.ends.map((end) => end.name)
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

    public setTrafficPattern(end:string, pattern:PatternDirection) {
        const rwyEnd:RunwayEnd|undefined = this.getEnd(end)
        if(!rwyEnd) throw new Error(`Runway end [${end}] not found`)

        rwyEnd.setTrafficPattern(pattern)
    }

    public setSurface(type:string, condition:string) {
        this.surface = new RunwaySurface(type, condition)
    }

    public setRunwaySurface(rwySurface:RunwaySurface) {
        this.surface = rwySurface
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
    id:number|undefined;
    code: string;
    name: string;
    elev: number;
    freq: Frequency[];
    rwys: Runway[];
    custom: boolean;
    version:number; 
    effectiveDate:string;
    fetchTime:number;
    location: { lat: number; lon: number }|undefined;

    constructor(code:string, name:string, elevation:number) {
        this.id = undefined;
        this.code = code;
        this.name = name;
        this.elev = elevation;
        this.freq = [];
        this.rwys = [];
        this.custom = false;
        this.version = modelVersion;
        this.effectiveDate = '';
        this.fetchTime = 0;
        this.location = undefined;
    }

    public static isValidCode(code:string):boolean {
        return code != null && ( code.length == 3 || code.length == 4)
    }

    public static isValidVersion(version:number):boolean {
        return version == Airport.currentVersion
    }
    
    // add several frequencies at th end of existing frequencies
    addFrequencies(frequencies:Frequency[]) {
        this.freq.push(...frequencies);
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

    getFreq(name:string):number|undefined {
        return this.freq.find((freq) => freq.name == name)?.mhz
    }

    getVersion():number {
        return this.version
    }

    setEffectiveDate(date:string) {
        this.effectiveDate = date;
    }

    setLocation(spatialReference:string) {
        if( spatialReference.startsWith('SRID=4326;POINT')) {
            const point:string[] = spatialReference.substring(16).split(' ')
            this.location = { lat: parseFloat(point[1]), lon: parseFloat(point[0]) }
        } else {
            this.location = undefined
        }
    }

    setRunwayFrequency(rwyName:string, frequency:number) {
        // console.log('[Airport.setRunwayFrequency]', rwyName, frequency)
        const rwy:Runway|undefined = this.rwys.find((rwy) => rwy.name == rwyName)
        if( rwy) {
            rwy.freq = frequency;
            this.addFrequency('RWY ' + rwyName, frequency)
        }
    }
}