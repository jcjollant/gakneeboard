import { Chart } from "./Chart";

export class AirportChartData {
    public iap:Chart[]
    public diagram:string|undefined;
    public dep:Chart[]

    constructor(iap:Chart[]=[], diagram:string|undefined=undefined, departure:Chart[]=[]) {
        this.iap = iap;
        this.diagram = diagram;
        this.dep = departure;
    }

    public addApproach(approach:Chart) {
        this.iap.push(approach);
    }

    public addDeparture(departure:Chart) {
        this.dep.push(departure);
    }
}