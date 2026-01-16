export class TemplateSettings {
    name:string;
    desc:string;
    ver:number;
    publish:boolean;
    constructor(name:string, desc:string, ver:number, publish:boolean) {
        this.name = name;
        this.desc = desc;
        this.ver = ver;
        this.publish = publish;
    }
}