const modelVersion: number = 16;
export const versionInvalid: number = -1

import { Atc } from './Atc'
import { Chart } from './Chart';
import { Frequency } from './Frequency'
import { Navaid } from './Navaid'
import { Runway } from './Runway'

export enum AirportSource {
    Adip = 'adip',
    User = 'user',
    SkyVector = 'skyvector'
}

export class Airport {
    static currentVersion: number = modelVersion;
    id: number | undefined;
    icaoId: string | undefined;
    locId: string | undefined;
    get code(): string { return this.icaoId || this.locId || '?' }

    toJSON() {
        return {
            ...this,
            code: this.code
        }
    }
    name: string;
    elev: number;
    tpa: number | undefined;
    freq: Frequency[];
    rwys: Runway[];
    navaids: Navaid[];
    atc: Atc[];
    custom: boolean;
    version: number;
    effectiveDate: string;
    fetchTime: number;
    location: { lat: number; lon: number } | undefined;
    iap: Chart[];
    dep: Chart[];
    diagram: string | undefined;
    sketch: string | undefined;
    source: AirportSource;
    supplement: string | undefined;
    notice: string | undefined;

    constructor(icaoId: string | undefined, locId: string | undefined, name: string, elevation: number) {
        this.id = undefined;
        this.icaoId = icaoId;
        this.locId = locId;
        this.name = name;
        this.elev = elevation;
        this.tpa = undefined;
        this.freq = [];
        this.rwys = [];
        this.navaids = [];
        this.atc = [];
        this.custom = false;
        this.version = modelVersion;
        this.effectiveDate = '';
        this.fetchTime = 0;
        this.location = undefined;
        this.iap = []
        this.dep = []
        this.diagram = undefined;
        this.source = AirportSource.Adip;
        this.supplement = undefined;
        this.notice = undefined;
    }



    // add several frequencies at th end of existing frequencies
    addFrequencies(frequencies: Frequency[]) {
        this.freq.push(...frequencies);
    }

    addFrequency(name: string, mhz: number) {
        this.freq.push(new Frequency(name, mhz));
    }

    addNavaids(navaids: Navaid[]) {
        this.navaids.push(...navaids);
    }

    addAtcs(atcs: Atc[]) {
        this.atc.push(...atcs);
    }

    /**
     * Add a single runway to the airport
     * @param runway 
     */
    addRunway(runway: Runway) {
        this.rwys.push(runway);
    }

    /**
     * Add multiple runways to the airport
     * @param runways 
     */
    addRunways(runways: Runway[]) {
        this.rwys.push(...runways);
    }

    getFreq(name: string): number | undefined {
        return this.freq.find((freq) => freq.name == name)?.mhz
    }

    /**
     * Static utility to find the mhz of a given frequency looked up by name
     * @param freq 
     * @param name 
     * @returns 
     */
    static getFrequencyMhz(freq: Frequency[], name: string) {
        return freq.find((freq) => freq.name == name)?.mhz
    }


    getVersion(): number {
        return this.version
    }

    setEffectiveDate(date: string) {
        this.effectiveDate = date;
    }

    setLocation(spatialReference: string) {
        if (spatialReference.startsWith('SRID=4326;POINT')) {
            const point: string[] = spatialReference.substring(16).split(' ')
            this.location = { lat: parseFloat(point[1]), lon: parseFloat(point[0]) }
        } else {
            this.location = undefined
        }
    }

    setRunwayFrequency(rwyName: string, frequency: number) {
        // console.log('[Airport.setRunwayFrequency]', rwyName, frequency)
        const rwy: Runway | undefined = this.rwys.find((rwy) => rwy.name == rwyName)
        if (rwy) {
            rwy.freq = frequency;
            this.addFrequency('RWY ' + rwyName, frequency)
        }
    }

    setTrafficPatternAltitude(newTpa: number) {
        this.tpa = newTpa;
    }
}