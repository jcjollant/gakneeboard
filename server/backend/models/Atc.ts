export class Atc {
    mhz: number;
    name: string;
    use: string[];
    
    constructor(frequency:number, name:string, use:string) {
        this.mhz = frequency;
        this.name = name;
        this.use = [use];
    }

    addUse(use:string) {
        this.use.push(use)
    }
}