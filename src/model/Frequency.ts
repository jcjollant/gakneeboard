import { FrequencyType } from "./FrequencyType";

export class Frequency {
    mhz:number;
    name:string;

    constructor(mhz:number, name:string='') {
        this.mhz = mhz;
        this.name = name;
    }

    static copy(freq:Frequency):Frequency {
        return new Frequency(Number(freq.mhz), freq.name)
    }
    static noFreq() {
        return new Frequency(0, '')
    }

    static fromType(mhz:number|undefined, type:FrequencyType):Frequency {
        let name:string;
        switch(type) {
            case FrequencyType.clearance: name = 'Clearance'; break;
            case FrequencyType.ctaf: name =  'CTAF'; break;
            case FrequencyType.tower: name =  'Tower'; break;
            case FrequencyType.ground: name =  'Ground'; break;
            case FrequencyType.weather: name =  'Weather'; break;
            case FrequencyType.custom: name =  'Custom'; break;
            default: name = 'Unknown';
        }
        return new Frequency(mhz ? mhz : 0, name)
    }
}