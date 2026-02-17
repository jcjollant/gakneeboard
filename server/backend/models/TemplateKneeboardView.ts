import { Publication } from "./Publication";
import { Template } from "./Template";
import { KneeboardView, TemplateFormat } from "@gak/shared";

export class TemplateKneeboardView extends KneeboardView {

    constructor(
        id: number,
        name: string,
        dataParam: any,
        format: TemplateFormat = TemplateFormat.Kneeboard,
        description: string | undefined = undefined,
        version: number = 0,
        publish: boolean | undefined = false,
        code: string | undefined = undefined,
        pages: number = 0,
        thumbnail: string | undefined = undefined,
        thumbHash: string | undefined = undefined,
        system: boolean | undefined = undefined,
    ) {
        let data: any;
        // whatever is passed, we want data to be an object
        if (typeof dataParam == 'string') {
            data = JSON.parse(dataParam);
        } else {
            data = dataParam;
        }

        // Calculate pages it it's not provided
        const numPages = pages ? pages : (data.length ? data.length : 0);

        super(id, name, data, publish ?? false, code, description, version, numPages, format, thumbnail, thumbHash, system);
    }

    static parse(sheet: any): TemplateKneeboardView {
        return new TemplateKneeboardView(sheet.id, sheet.name, sheet.data, sheet.format, sheet.description, sheet.ver, sheet.publish, sheet.code);
    }

    /**
     * Create a view from template and publication
     * @param template 
     * @param pub 
     * @returns 
     */
    static parseTemplate(template: Template, pub: Publication | undefined = undefined): TemplateKneeboardView {
        const publish = pub ? pub.active : false;
        const code = pub ? pub.code : undefined;
        // if user_id is null/undefined, it is a system template
        const system = template.userId ? undefined : true;
        return new TemplateKneeboardView(template.id, template.name, template.data, template.format, template.description, template.version, publish, code, template.pages, template.thumbnail, template.thumbhash, system);
    }
}