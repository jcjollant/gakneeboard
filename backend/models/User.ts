import { createHash } from 'crypto'

export class User {
    id:number;
    sha256:string;
    name:string;
    source:string;
    email:string;
    maxTemplates:number;

    public static defaultMaxTemplates:number = 5;

    constructor( id:number, sha256:string) {
        this.id = id;
        this.sha256 = sha256;
        this.name = '';
        this.source = '';
        this.email = '';
        this.maxTemplates = User.defaultMaxTemplates;
    }


    // public getSha256():string {
    //     return this.sha256
    // }

    public static createSha256(input: any):string {
        return createHash('sha256').update(JSON.stringify(input)).digest('hex')
    }
 
    // creates a user from it's data representation
    public static fromJson(id:number, sha256:string, rawData:string):User {
        const user = new User(id, sha256)
        const data = JSON.parse(rawData)
        if(data.source) user.setSource(data.source)
        if(data.email) user.setEmail(data.email)
        if(data.name) user.setName(data.name)
        if(data.maxTemplates) user.setMaxTemplates(data.maxTemplates)

        return user
    }

    public setEmail(email:string) {
        this.email = email;
    }

    public setSource(source:string) {
        this.source = source;
    }

    public setMaxTemplates( newMax:number) {
        this.maxTemplates = newMax;
    }

    public setName( newName:string) {
        this.name = newName;
    }    
}