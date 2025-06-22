import { Publication } from "./Publication";
import { Template } from "./Template";
import { TemplateFormat } from "./TemplateFormat";

export class TemplateView {
    id:number;
    name:string;
    data:any;
    publish:boolean;
    code:string|undefined;
    desc:string|undefined;
    ver:number;
    pages:number;
    format:string;
    thumbUrl:string|undefined
    thumbHash:string|undefined

    constructor( 
            id:number, 
            name:string, 
            dataParam:any, 
            format:TemplateFormat=TemplateFormat.Kneeboard,
            description:string|undefined=undefined, 
            version:number=0, 
            publish:boolean|undefined=false, 
            code:string|undefined=undefined, 
            pages:number=0, 
            thumbnail:string|undefined=undefined,
            thumbHash:string|undefined=undefined,
            ) {
        this.id = id;
        this.name = name;
        this.desc = description ? description : undefined;
        // whatever is passed, we want data to be an object
        if( typeof dataParam == 'string') {
            this.data = JSON.parse(dataParam);
        } else {
            this.data = dataParam;
        }
        this.format = format;
        this.ver = version;
        this.publish = publish ?? false; // false if undefined
        this.code = code;
        // Calculate pages it it's not provided
        this.pages = pages ? pages : (this.data.length ? this.data.length : 0);
        this.thumbUrl = thumbnail;
        this.thumbHash = thumbHash;
    }

    static parse(sheet: any): TemplateView {
        return new TemplateView(sheet.id, sheet.name, sheet.data, sheet.format, sheet.description, sheet.ver, sheet.publish, sheet.code);
    }

    /**
     * Create a view from template and publication
     * @param template 
     * @param pub 
     * @returns 
     */
    static parseTemplate(template:Template, pub:Publication|undefined = undefined): TemplateView {
        const publish = pub ? pub.active : false;
        const code = pub ? pub.code : undefined;
        return new TemplateView(template.id, template.name, template.data, template.format, template.description, template.version, publish, code, template.pages, template.thumbnail, template.thumbhash);
    }
}