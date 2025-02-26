import { Frequency, FrequencyType } from "./Frequency";

const modelVersion:number = 9;

class AirportFrequency {
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
        this.setMagneticOrientation(orientation);
    }

    setMagneticOrientation(value:number) {
        this.mag = value % 360;
    }
    setRightPattern(really:boolean=true) {
        this.tp = really ? Runway.rightPattern : Runway.leftPattern;
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
    freq: number;
    public static rightPattern:string = 'R';
    public static leftPattern:string = 'L';

    constructor(name:string, length:number, width:number) {
        this.name = name;
        this.length = length;
        this.width = width;
        const ends:string[]  = name.split('-')
        this.ends = []
        this.ends.push( ...ends.map( (end) =>  new RunwayEnd(end, parseInt(end)*10) ) ); 
        this.freq = 0;
        this.surface = undefined;
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

    public setTrafficPattern(end:string, pattern:string) {
        const rwyEnd:RunwayEnd|undefined = this.getEnd(end)
        if(rwyEnd) {
            switch(pattern) {
                case Runway.leftPattern:
                    rwyEnd.setRightPattern(false)
                    break;
                case Runway.rightPattern:
                    rwyEnd.setRightPattern(true)
                    break;
                default:
                    throw new Error(`Invalid traffic pattern ${pattern}`)
            }
        } else {
            throw new Error(`Runway end ${end} not found`)
        }
    }

    public setSurface(type:string, condition:string) {
        this.surface = new RunwaySurface(type, condition)
    }


    static copy(from:any):Runway {
        if(!from) return Runway.noRunway()

        const runway:Runway = new Runway(from.name, from.length, from.width)
        runway.ends = from.ends.map((end:any) => new RunwayEnd(end.name, end.mag))
        runway.surface = new RunwaySurface(from.surface.type, from.surface.cond)
        runway.freq = from.freq
        return runway
    }

    static noRunway(): Runway {
        return new Runway('', 0, 0);
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

export class Chart {
    name: string;
    pdf: string;
    constructor(name:string, pdf:string) {
        this.name = name;
        this.pdf = pdf;
    }
    static copy(chart:any) {
        return new Chart(chart.name, chart.pdf)
    }
}

export class Navaid {
    id:string;
    freq:number;
    type:string;
    dist:number;
    to:number;
    constructor(id:string, freq:number, type:string, dist:number, to:number) {
        this.id = id;
        this.freq = freq;
        this.type = type;
        this.dist = dist;
        this.to = to;
    }
    static copy(navaid:any):Navaid {
        return new Navaid(navaid.id, navaid.freq, navaid.type, navaid.dist, navaid.to)
    }
}

export class Atc {
    mhz: number;
    name: string;
    use: string[];
    constructor(mhz:number, name:string, use:string[]) {
        this.mhz = mhz;
        this.name = name;
        this.use = use;
    }
    static copy(atc:any):Atc {
        return new Atc(atc.mhz, atc.name, atc.use)
    }
}

export class Airport {
    // copy constructor
    static currentVersion:number = modelVersion;
    code: string;
    name: string;
    elev: number;
    tpa: number|undefined;
    freq: AirportFrequency[];
    rwys: Runway[];
    custom: boolean;
    version:number;
    effectiveDate:string;
    asof:number;
    iap: Chart[];
    dep: Chart[];
    diagram:string|undefined;
    navaids:Navaid[];
    atc:Atc[];

    constructor(code:string='', name:string='', elevation:number=0) {
        this.code = code;
        this.name = name;
        this.elev = elevation;
        this.tpa = undefined;
        this.freq = [];
        this.rwys = [];
        this.custom = false;
        this.version = modelVersion;
        this.effectiveDate = '';
        this.asof = 0;
        this.iap = [];
        this.dep = [];
        this.diagram = undefined;
        this.navaids = [];
        this.atc = [];
    }

    // copy constructor
    static copy(airport:any) {
        if(airport instanceof Airport) return airport;

        const newAirport = new Airport(airport.code, airport.name, airport.elev)
        newAirport.tpa = airport.tpa
        newAirport.freq = airport.freq
        newAirport.rwys = airport.rwys
        newAirport.custom = airport.custom
        newAirport.version = airport.version
        newAirport.effectiveDate = airport.effectiveDate
        newAirport.asof = airport.asof;
        newAirport.iap = airport.iap.map((chart:any) => Chart.copy(chart))
        newAirport.dep = airport.iap.map((chart:any) => Chart.copy(chart))
        newAirport.diagram = airport.diagram ? airport.diagram : airport.diag
        newAirport.navaids = airport.navaids.map((navaid:any) => Navaid.copy(navaid))
        newAirport.atc = airport.atc.map((atc:any) => Atc.copy(atc))
        
        return newAirport
    }

    public static isValidCode(code:string):boolean {
        return code != null && ( code.length == 3 || code.length == 4)
    }

    public static isValidVersion(version:number):boolean {
        return version == Airport.currentVersion
    }
    
    addFrequency(name:string, mhz:number) {
        this.freq.push(new AirportFrequency(name,mhz));
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

    // returns a number
    getFreq(name:string):number|undefined {
        return this.freq.find((freq) => freq.name == name)?.mhz
    }

    // retuns a Frequency
    getFrequency(name:string):AirportFrequency|undefined {
        return this.freq.find((freq) => freq.name == name)
    }

    getFreqClearance():number|undefined {
        return this.getFreq('CD/P')
    }

    getFreqCtaf():number|undefined {
        return this.getFreq('CTAF');
    }

    getFreqGround():Frequency {
        const af = this.getFrequency('GND');
        const name = Frequency.typeToString(FrequencyType.ground);
        if( af) {
            return new Frequency(af.mhz, name, FrequencyType.ground)
        }
        return  Frequency.noFreq(name, FrequencyType.ground)
    }

    getFreqTower():number|undefined {
        return this.getFreq('TWR');
    }

    getFreqTowerIfr():number|undefined {
        const list = this.freq.filter( f => f.name.includes('TWR'))
        if( list.length == 0) return undefined
        // return the first element
        return list.sort( (f1,f2) => f2.mhz - f1.mhz)[0].mhz;
    }

    getFreqWeather():AirportFrequency|undefined {
        const patterns = ['ATIS','ASOS','AWOS','Weather']
        // test wether freq.name contains any of the patterns
        return this.freq.find((freq) => (patterns.some(p => freq.name.includes(p))))
    }

    isValid():boolean {
        return Airport.isValidCode(this.code) && Airport.isValidVersion(this.version) && this.rwys.length > 0;
    }

    setEffectiveDate(date:string) {
        this.effectiveDate = date;
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