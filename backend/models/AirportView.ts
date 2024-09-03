import { Airport } from './Airport'
import { Atc } from './Atc'
import { Frequency } from './Frequency'
import { Navaid } from './Navaid'
import { Runway } from './Runway'

export class AirportView {
    public static currentVersion:number = 5;
    public static invalidVersion:number = -1;
    code: string;
    name: string;
    elev: number;
    tpa:number|undefined;
    freq: Frequency[];
    rwys: Runway[];
    navaids: Navaid[];
    atc:Atc[];
    custom: boolean;
    asof: number;
    version:number = AirportView.currentVersion;

    constructor(airport:Airport|undefined) {
        if(airport) {
            this.code = airport.code;
            this.name = airport.name;
            this.elev = airport.elev;
            this.custom = airport.custom;
            // rewrite this
            this.tpa = airport.tpa || undefined;
            this.asof = AirportView.formatAsOf(airport.effectiveDate);
        } else {
            this.code = '';
            this.name = '';
            this.elev = 0;
            this.tpa = undefined;
            this.custom = false;
            this.asof = 0;
            this.version = AirportView.invalidVersion;
        }
        this.freq = (airport && airport.freq) ? airport.freq : []
        this.rwys = (airport && airport.rwys) ? airport.rwys : []
        this.navaids = (airport && airport.navaids) ? airport.navaids : []
        this.atc = (airport && airport.atc) ? airport.atc : []
    }

    public static formatAsOf(date:string):number {
        // examples
        // "effectiveDate":"2024-07-11T00:00:00"
        // "effectiveDate":"2024-08-08T00:00:00"
        // extract year, month, and day from the string
        if( date && date.length >= 10 && date[4] == '-' && date[7] == '-') {
            const year = parseInt(date.substring(0, 4));
            const month = parseInt(date.substring(5, 7));
            const day = parseInt(date.substring(8, 10));
            // turn it into a number
            return year * 10000 + month * 100 + day;
        } else { // invalid date format
            return 0;
        }
    }

    static getUndefined(code: any): AirportView {
        const view = new AirportView(undefined);
        view.code = code;
        return view
    }
     
}