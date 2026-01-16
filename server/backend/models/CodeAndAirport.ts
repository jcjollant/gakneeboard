import { Airport } from "./Airport";

export class CodeAndAirport {
    code: string;
    airport: Airport|undefined;
    constructor(code: string, airport: Airport=undefined) {
        this.code = code;
        this.airport = airport;
    }

    static undefined( code:string):CodeAndAirport {
        return new CodeAndAirport(code, undefined)
    }
}