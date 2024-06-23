export class Sheet {
    id:number;
    name:string;
    data:any;

    constructor(id:number, name:string, strData:string) {
        this.id = id;
        this.name = name;
        this.data = JSON.parse(strData);
    }
}