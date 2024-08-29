export class CurrentUser {
    sha256:string;
    name:string;
    promise:Promise<CurrentUser>;
    templates:any[]
}