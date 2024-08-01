export class Publication {
    id: number;
    code:string|undefined;
    sheetid:number|undefined;
    constructor(id:number, code:string|undefined, sheetid:number|undefined) {
        this.id = id;
        this.code = code;
        this.sheetid = sheetid;
    }
}