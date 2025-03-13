import { TemplateView } from "./TemplateView"

export class PageType {
  static selection = 'selection'
  static tiles = 'tiles'
  static checklist = 'checklist'
  static cover = 'cover'
  static navLog = 'navlog'
  static notes = 'notes'
}

export class Tile {
    static airport:string = 'airport';
    static atis:string = 'atis';
    static checklist:string = 'checklist';
    static clearance:string = 'clearance';
    static fuel:string = 'fuel';
    static navlog:string = 'navlog';
    static notes:string = 'notes';
    static radios:string = 'radios';
    static sunlight:string = 'sunlight';
}

export class Template {
    id:number;
    userId:number;
    data:any;
    name:string;
    version:number;
    description:string|undefined;
    creationDate:Date|undefined;
    pages:number;

    constructor(id:number, userId:number, data:any, name:string, description:string|undefined, version:number, page:number, creationDate:Date|undefined=undefined) {
        this.id = id;
        this.userId = userId;
        this.data = data;
        this.name = name;
        this.version = version;
        this.description = description;
        this.creationDate = creationDate;
        this.pages = page;
    }

    static fromView(templateView: TemplateView, userId:number):Template {
        return new Template( templateView.id, userId, templateView.data, templateView.name, templateView.desc, templateView.ver, templateView.pages);
    }
}

