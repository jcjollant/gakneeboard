import { TemplateFormat } from "@gak/shared"

export class PageType {
    static selection = 'selection'
    static tiles = 'tiles'
    static checklist = 'checklist'
    static cover = 'cover'
    static navLog = 'navlog'
    static notes = 'notes'
}

export class Tile {
    static airport: string = 'airport';
    static atis: string = 'atis';
    static checklist: string = 'checklist';
    static clearance: string = 'clearance';
    static fuel: string = 'fuel';
    static navlog: string = 'navlog';
    static notes: string = 'notes';
    static radios: string = 'radios';
    static sunlight: string = 'sunlight';
}

export class Template {
    id: number
    userId: number | undefined
    data: any
    format: TemplateFormat
    name: string
    version: number
    description: string | undefined
    pages: number
    thumbnail: string | undefined
    thumbhash: string | undefined
    creationDate: Date | undefined

    constructor(id: number,
        userId: number | undefined,
        data: any,
        format: TemplateFormat,
        name: string,
        description: string | undefined,
        version: number,
        page: number,
        thumbnail: string | undefined = undefined,
        thumbhash: string | undefined = undefined,
        creationDate: Date | undefined = undefined) {
        this.id = id;
        this.userId = userId;
        this.data = data;
        this.format = format;
        this.name = name;
        this.version = version;
        this.description = description;
        this.pages = page;
        this.thumbnail = thumbnail
        this.thumbhash = thumbhash
        this.creationDate = creationDate;
    }
}

