import { Airport, Frequency, Runway, RunwayEnd, Navaid, PatternDirection } from "./Airport";


export class AirportView {
    public static currentVersion:number = 2;
    public static invalidVersion:number = -1;
    code: string;
    name: string;
    elev: number;
    freq: Frequency[];
    rwys: Runway[];
    navaids: Navaid[];
    custom: boolean;
    version: number;

    constructor(airport:Airport|undefined) {
        if(airport) {
            this.code = airport.code;
            this.name = airport.name;
            this.elev = airport.elev;
            this.custom = airport.custom;
            this.version = AirportView.currentVersion;
        } else {
            this.code = '';
            this.name = '';
            this.elev = 0;
            this.custom = false;
            this.version = AirportView.invalidVersion;
        }
        this.freq = (airport && airport.freq) ? airport.freq : []
        this.rwys = (airport && airport.rwys) ? airport.rwys : []
        this.navaids = (airport && airport.navaids) ? airport.navaids : []
    }

    static getUndefined(code: any): AirportView {
        const view = new AirportView(undefined);
        view.code = code;
        return view
    }
     
}