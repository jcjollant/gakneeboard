import { Approach } from "./Approach";

export class AirportChartData {
    public iap:Approach[]
    public diagram:string|undefined;

    constructor(iap:Approach[]=[], diagram:string|undefined=undefined) {
        this.iap = iap;
        this.diagram = diagram;
    }

    public addApproach(approach:Approach) {
        this.iap.push(approach);
    }
}