export enum FrequencyType {
    clearance = 'cd',
    ctaf = 'ct',
    custom = 'cu',
    navaid = 'n',
    weather = 'w',
    tracon = 'tr',
    tower = 'tw',
    ground = 'g',
    unknown = '?',
}

export class FrequencyLabelled {
    freq:Frequency;
    label:string;
    constructor(freq:Frequency, label:string) {
        this.freq = freq;
        this.label = label;
    }
}



export class Frequency {
    mhz:number;
    name:string;
    type:FrequencyType;

    constructor(mhz:number, name:string='', type:FrequencyType=FrequencyType.unknown) {
        this.mhz = mhz;
        this.name = name;
        this.type = type;
    }

    static copy(freq:Frequency):Frequency {
        return new Frequency(Number(freq.mhz), freq.name, freq.type)
    }

    static typeFromString(s:string):FrequencyType {
        if(!s) return FrequencyType.unknown

        switch(s.toLowerCase()) {
            case 'clearance':
            case 'CD/P':
            case FrequencyType.clearance: 
                return FrequencyType.clearance;
            case 'ctaf': 
            case FrequencyType.ctaf: 
                return FrequencyType.ctaf;
            case FrequencyType.custom: 
                return FrequencyType.custom;
            case 'navaid':
            case FrequencyType.navaid: 
                return FrequencyType.navaid;
            case 'atis':
            case 'asos':
            case 'awos':
            case 'weather':
            case FrequencyType.weather: 
                return FrequencyType.weather;
            case 'tracon':
            case FrequencyType.tracon: 
                return FrequencyType.tracon;
            case 'tower':
            case 'twr':
            case FrequencyType.tower: 
                return FrequencyType.tower;
            case 'ground':
            case 'gnd':
            case FrequencyType.ground: 
                return FrequencyType.ground;
            default: 
                return FrequencyType.unknown;
        }
    }
    
    static typeToString(type:FrequencyType) {
        switch(type) {
            case FrequencyType.clearance: return 'Clearance';
            case FrequencyType.ctaf: return 'CTAF';
            case FrequencyType.tower: return 'Tower';
            case FrequencyType.tracon: return 'TRACON';
            case FrequencyType.ground: return 'Ground';
            case FrequencyType.navaid: return 'Navaid';
            case FrequencyType.weather: return 'Weather';
            case FrequencyType.custom: return 'Custom';
            default: return 'Unknown';
        }
    }

    static noFreq() {
        return new Frequency(0, '')
    }

    static fromType(mhz:number|undefined, type:FrequencyType):Frequency {
        let name:string = Frequency.typeToString(type);
        return new Frequency(mhz ? mhz : 0, name, type)
    }

}