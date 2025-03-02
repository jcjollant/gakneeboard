export class Ils {
    id: string;
    locFreq:number;
    rwyName:string;
    constructor(id:string, locFreq:string, rwyName:string) {
        this.id = id;
        this.locFreq = Number(locFreq);
        this.rwyName = rwyName;
    }
}