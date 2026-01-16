export class Publication {
    id: number;
    code:string|undefined;
    templateId:number|undefined;
    active:boolean;
    constructor(id:number, code:string|undefined, templateId:number|undefined, active:boolean|undefined) {
        this.id = id;
        this.code = code;
        this.templateId = templateId;
        this.active = active ?? true; // active if undefined
    }
}