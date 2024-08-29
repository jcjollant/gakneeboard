import { createHash } from 'crypto'

export class User {
    id:number;
    source:string;
    email:string;
    sha256:string;
    name:string;
    maxTemplates:number;

    public static defaultMaxTemplates:number = 5;

    constructor( source:string, email:string, maxTemplates:number|undefined=undefined) {
        this.id = 0;
        this.source = source;
        this.email = email;
        const user = {
            source: source,
            email: email,
        }
        this.sha256 = User.createSha256(user)
        this.name = ""
        this.maxTemplates = maxTemplates ? maxTemplates : User.defaultMaxTemplates;
    };

    // public getSha256():string {
    //     return this.sha256
    // }

    public static createSha256(input: any):string {
        return createHash('sha256').update(JSON.stringify(input)).digest('hex')
    }
 
    public setName( newName:string) {
        this.name = newName;
    }    
}