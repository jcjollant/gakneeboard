export class Navaid {
    id:string;
    freq:number;
    type:string;
    dist:number;
    to:number;
    constructor(id:string, freq:number, type:string, dist:number, to:number) {
        this.id = id;
        this.freq = freq;
        this.type = type;
        this.dist = dist;
        this.to = to;
    }
}
