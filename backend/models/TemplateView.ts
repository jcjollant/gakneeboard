import { Publication } from "./Publication";

export class TemplateView {
    id:number;
    name:string;
    data:any;
    publish:boolean;
    code:string|undefined;
    desc:string|undefined;
    ver:number;
    pages:number;

    constructor( 
            id:number, name:string, dataParam:any, description:string|undefined=undefined, 
            version:number=0, publish:boolean|undefined=false, code:string|undefined=undefined, pages:number=0) {
        this.id = id;
        this.name = name;
        this.desc = description ? description : undefined;
        // whatever is passed, we want data to be an object
        if( typeof dataParam == 'string') {
            this.data = JSON.parse(dataParam);
        } else {
            this.data = dataParam;
        }
        this.ver = version;
        this.publish = publish ?? false; // false if undefined
        this.code = code;
        this.pages = pages
    }

    setPublication(pub: Publication|undefined) {
        if(pub) {
            this.code = pub.code;
            this.publish = pub.active;
        } else {
            this.code = undefined;
            this.publish = false;
        }
    }
}