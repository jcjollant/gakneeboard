export class PublishedTemplate {
    code:string;
    name:string;
    desc:string;

    constructor(code:string, templateName:string, templateDescription:string) {
        this.code = code;
        this.name = templateName;
        this.desc = templateDescription;
    }
}