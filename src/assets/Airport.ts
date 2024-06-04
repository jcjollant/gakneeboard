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
    orientation: number;
    rightTrafficPattern: boolean;
    constructor(name:string, orientation:number, rightTrafficPattern:boolean) {
        this.name = name;
        this.orientation = orientation;
        this.rightTrafficPattern = rightTrafficPattern;
    }
    public getOrientation():number {
        return this.orientation;
    }
}

export class Runway {
    name: string;
    length: number;
    width: number;
    rwyEnds: RunwayEnd[];
    constructor(name:string, length:number, width:number) {
        this.name = name;
        this.length = length;
        this.width = width;
        const ends:string[]  = name.split('-')
        const orientation0:number = parseInt(ends[0]) * 10
        this.rwyEnds = []
        this.rwyEnds.push( ...ends.map( (end) =>  new RunwayEnd(end, parseInt(end)*10, false) ) ); 
    }
    public getEnd(name:string):RunwayEnd|undefined {
        return this.rwyEnds.find((end) => end.name === name)
    }
}

export class Airport {
    code: string;
    name: string;
    elevation: number;
    frequencies: Frequency[];
    runways: Runway[];

    constructor(code, name, elevation) {
        this.code = code;
        this.name = name;
        this.elevation = elevation;
        this.frequencies = [];
        this.runways = [];
    }

    addFrequency(name:string, mhz:number) {
        this.frequencies.push(new Frequency(name,mhz));
    }

    addRunway(runway:Runway) {
        this.runways.push(runway);
    }
}