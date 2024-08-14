const modelVersion:number = 9;
export const versionInvalid:number = -1

import { Atc } from './Atc'
import { Frequency } from './Frequency'
import { Navaid } from './Navaid'
import { Runway } from './Runway'

export class Airport {
    static currentVersion:number = modelVersion;
    id:number|undefined;
    code: string;
    name: string;
    elev: number;
    freq: Frequency[];
    rwys: Runway[];
    navaids: Navaid[];
    atc: Atc[];
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
        this.navaids = [];
        this.atc = [];
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

    addNavaids(navaids:Navaid[]) {
        this.navaids.push(...navaids);
    }

    addAtcs(atcs:Atc[]) {
        this.atc.push(...atcs);
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

    /**
     * Static utility to find the mhz of a given frequency looked up by name
     * @param freq 
     * @param name 
     * @returns 
     */
    static getFrequencyMhz(freq:Frequency[], name: string) {
        return freq.find((freq) => freq.name == name)?.mhz
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