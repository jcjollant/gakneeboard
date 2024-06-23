export class Sheet {
    id:number;
    name:string;
    data:any;

    constructor(id:number, name:string, dataParam:any) {
        this.id = id;
        this.name = name;
        // whatever is passed, we want data to be an object
        if( typeof dataParam == 'string') {
            this.data = JSON.parse(dataParam);
        } else {
            this.data = dataParam;
        }
    }
}