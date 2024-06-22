import { createHash } from 'crypto'

export class User {
    id:number;
    source:string;
    email:string;
    sha256:string;
    name:string;

    constructor( source:string, email:string) {
        this.id = 0;
        this.source = source;
        this.email = email;
        const user = {
            source: source,
            email: email,
        }
        this.sha256 = User.createSha256(user)
    
    };

    // public getSha256():string {
    //     return this.sha256
    // }

    public static createSha256(input: any):string {
        return createHash('sha256').update(JSON.stringify(input)).digest('hex')
    }
 
    public getMini():any {
        const miniUser = { sha256: this.sha256 , name: this.name}
        return miniUser;
    }

    public setName( newName:string) {
        this.name = newName;
    }    
}