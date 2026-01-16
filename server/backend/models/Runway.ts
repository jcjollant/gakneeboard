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
    constructor(name: string, orientation: number) {
        if (name.startsWith('RP')) {
            this.tp = PatternDirection.Right
            this.name = name.substring(2);
        } else {
            this.tp = PatternDirection.Left
            this.name = name;
        }
        this.mag = orientation % 360;
        // this.setMagneticOrientation(orientation);
    }

    setMagneticOrientation(value: number) {
        this.mag = value % 360;
    }

    setTrafficPattern(direction: PatternDirection) {
        this.tp = direction
    }
}

export class RunwaySurface {
    type: string;
    cond: string;
    constructor(type: string, condition: string) {
        this.type = type;
        this.cond = condition;
    }
}

export class Runway {
    name: string;
    length: number;
    width: number;
    ends: RunwayEnd[];
    surface: RunwaySurface | undefined;
    freq: number | undefined;
    // public static rightPattern:string = 'R';
    // public static leftPattern:string = 'L';

    constructor(name: string, length: number, width: number) {
        this.name = name;
        this.length = length;
        this.width = width;
        // split the name using '-' or '/' depending on the format
        const ends: string[] = name.split(/[-/]/)
        this.ends = []
        this.ends.push(...ends.map((end) => new RunwayEnd(end, parseInt(end) * 10)));
        // Test ends are 180 degrees apart
        if (Math.abs(this.ends[0].mag - this.ends[1].mag) != 180) throw new Error('Runway ends must be 180 degrees apart')

        this.freq = undefined
        this.surface = undefined
    }
    public getEnd(name: string): RunwayEnd | undefined {
        return this.ends.find((end) => end.name === name)
    }

    public getEndsName(): string[] {
        return this.ends.map((end) => end.name)
    }

    public getOrientation(end: string): number | undefined {
        const rwyEnd: RunwayEnd | undefined = this.getEnd(end)
        if (rwyEnd) {
            return rwyEnd.mag
        }
        return undefined
    }

    public getTrafficPattern(end: string): string | undefined {
        const rwyEnd: RunwayEnd | undefined = this.getEnd(end)
        if (rwyEnd) {
            return rwyEnd.tp
        }
        return undefined
    }

    public setTrafficPattern(end: string, pattern: PatternDirection) {
        const rwyEnd: RunwayEnd | undefined = this.getEnd(end)
        if (!rwyEnd) throw new Error(`Runway end [${end}] not found`)

        rwyEnd.setTrafficPattern(pattern)
    }

    public setSurface(type: string, condition: string) {
        this.surface = new RunwaySurface(type, condition)
    }

    public setRunwaySurface(rwySurface: RunwaySurface) {
        this.surface = rwySurface
    }

    static isValidEndName(name: string): boolean {
        // catch too short and too long runway names 
        if (name.length < 2 || name.length > 3) return false

        if (name.length == 3) {
            const position: string = name.charAt(2)
            // position must be L, R or C
            if (position != 'L' && position != 'R' && position != 'C') return false
        }

        // validate runway number
        const number: number = parseInt(name.substring(0, 2))

        return number >= 1 && number <= 36
    }
    // this method checks wether a runway name is valid
    public static isValidName(name: string): boolean {
        const ends: string[] = name.split(/[-/]/)
        // we need exactly 2 runway ends
        if (ends.length != 2) return false
        // both ends must be valid
        if (!Runway.isValidEndName(ends[0]) || !Runway.isValidEndName(ends[1])) return false

        return true
    }

}
