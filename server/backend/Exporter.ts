import { AceWriter } from "./exporters/AceWriter";
import { FmdWriter } from "./exporters/FmdWriter";
import { GApiError } from "./GApiError";
import { Template } from "./models/Template";
import { TemplateKneeboardView } from "./models/TemplateKneeboardView";

export class Exporter {
    fileName: string;
    arrayBuffer: ArrayBuffer;

    static FORMAT_ACE = 'ace';
    static FORMAT_FMD = 'fmd';

    constructor(fileName: string, arrayBuffer: ArrayBuffer) {
        this.fileName = fileName;
        this.arrayBuffer = arrayBuffer;
    }

    static async export(template: TemplateKneeboardView, format: string): Promise<Exporter> {
        if (format === Exporter.FORMAT_ACE) {
            const arrayBuffer = await AceWriter.encodeTemplate(template)
            return new Exporter('kneeboard.ace', arrayBuffer)
        } else if (format == Exporter.FORMAT_FMD) {
            const arrayBuffer = await FmdWriter.encodeTemplate(template)
            return new Exporter('kneeboard.fmd', arrayBuffer)
        }

        throw new GApiError(400, 'Unsupported export format [' + format + ']');
    }

}