export class Frequency {
    name: string;
    mhz: number;
    notes: string;
    
    constructor(name:string, frequency:number, notes:string='') {
        this.name = name;
        this.mhz = frequency;
        this.notes = notes;
    }
}