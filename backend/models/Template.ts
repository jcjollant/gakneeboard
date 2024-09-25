import { Publication } from "./Publication";

export class Template {
    id:number;
    name:string;
    data:any;
    publish:boolean;
    code:string|undefined;
    desc:string|undefined;

    constructor(id:number, name:string, dataParam:any, description:string|undefined=undefined, publish:boolean|undefined=false, code:string|undefined=undefined) {
        this.id = id;
        this.name = name;
        this.desc = description ? description : undefined;
        // whatever is passed, we want data to be an object
        if( typeof dataParam == 'string') {
            this.data = JSON.parse(dataParam);
        } else {
            this.data = dataParam;
        }
        this.publish = publish ?? false; // false if undefined
        this.code = code;
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