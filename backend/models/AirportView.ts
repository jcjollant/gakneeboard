import { Airport, Frequency, Runway } from "./Airport";



export class AirportView {
    public static currentVersion:number = 1;
    code: string;
    name: string;
    elev: number;
    freq: Frequency[];
    rwys: Runway[];
    custom: boolean;
    version: number;
    constructor(airport:Airport|undefined) {
        if(airport) {
            this.code = airport.code;
            this.name = airport.name;
            this.elev = airport.elev;
            this.freq = airport.freq;
            this.rwys = airport.rwys;
            this.custom = airport.custom;
            this.version = AirportView.currentVersion;
        } else {
            this.code = '';
            this.name = '';
            this.elev = 0;
            this.freq = [];
            this.rwys = [];
            this.custom = false;
            this.version = -1;
        }
    }

    static getUndefined(code: any): AirportView {
        const view = new AirportView(undefined);
        view.code = code;
        return view
    }
    
}