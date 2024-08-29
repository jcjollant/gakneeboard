export class Publication {
    id: number;
    code:string|undefined;
    templateId:number|undefined;
    constructor(id:number, code:string|undefined, templateId:number|undefined) {
        this.id = id;
        this.code = code;
        this.templateId = templateId;
    }
}