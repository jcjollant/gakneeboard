import { Formatter } from "../lib/Formatter";

export enum FrequencyType {
    clearance = 'cd',
    ctaf = 'ct',
    custom = 'cu',
    navaid = 'n',
    phone = 'pn',
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
    value:string;
    name:string;
    type:FrequencyType;

    constructor(value:string, name:string='', type:FrequencyType=FrequencyType.unknown) {
        // console.log('[Frequency.constructor]', value, name, type)
        this.value = value;
        this.name = name;
        this.type = type;
    }

    static copy(freq:any):Frequency {
        let value = 'value' in freq ? freq.value : freq.mhz
        if( typeof value === 'number' ) value = Formatter.frequency(freq.mhz)
        return new Frequency(value, freq.name, freq.type)
    }

    static typeFromString(s:string):FrequencyType {
        // console.log('[Frequency.typeFromString] ->' + s + '<-' )
        if(!s) return FrequencyType.unknown
        const lowerCaseFreq = s.toLowerCase()

        switch(lowerCaseFreq) {
            case 'clearance':
            case 'cd/p':
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
            case 'atis': case 'd-atis':
            case 'asos': case 'awos': 
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
            case 'unicom':
            case FrequencyType.ground: 
                return FrequencyType.ground;
            case 'phone':
            case FrequencyType.phone:
                return FrequencyType.phone;
            default: 
                if(lowerCaseFreq.startsWith('awos') || lowerCaseFreq.startsWith('asos')) {
                    return FrequencyType.weather;
                } else if(lowerCaseFreq.startsWith('loc')) {
                    return FrequencyType.navaid;
                }
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
            case FrequencyType.phone: return 'Phone';
            default: return 'Unknown';
        }
    }

    static noFreq(name='',type=FrequencyType.unknown) {
        return new Frequency('', name, type)
    }

    static fromType(value:number|undefined, type:FrequencyType):Frequency {
        let name:string = Frequency.typeToString(type);
        return value ? new Frequency(Formatter.frequency(value), name, type) : Frequency.noFreq(name, type)
    }
}