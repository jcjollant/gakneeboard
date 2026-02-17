import { TemplateFormat } from './TemplateFormat';

export abstract class KneeboardView {
    id: number;
    name: string;
    data: any;
    publish: boolean;
    code: string | undefined;
    desc: string | undefined;
    ver: number;
    pages: number;
    format: TemplateFormat;
    thumbUrl: string | undefined;
    thumbHash: string | undefined;
    system: boolean | undefined;

    constructor(
        id: number,
        name: string,
        data: any,
        publish: boolean,
        code: string | undefined,
        desc: string | undefined,
        ver: number,
        pages: number,
        format: TemplateFormat,
        thumbUrl: string | undefined,
        thumbHash: string | undefined,
        system: boolean | undefined
    ) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.publish = publish;
        this.code = code;
        this.desc = desc;
        this.ver = ver;
        this.pages = pages;
        this.format = format;
        this.thumbUrl = thumbUrl;
        this.thumbHash = thumbHash;
        this.system = system;
    }
}
