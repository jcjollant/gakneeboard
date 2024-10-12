import { AceWritter } from "./AceWritter";
import { GApiError } from "./GApi";
import { Template } from "./models/Template";

export class Exporter {
    fileName:string;
    arrayBuffer:ArrayBuffer;

    static FORMAT_ACE='ace';

    constructor(fileName:string, arrayBuffer:ArrayBuffer) {
        this.fileName = fileName;
        this.arrayBuffer = arrayBuffer;
    }

    static async export(template: Template, format: string): Promise<Exporter> {
        if(format === Exporter.FORMAT_ACE) {
            const arrayBuffer = await AceWritter.fromTemplate(template)
            return new Exporter('kneeboard.ace', arrayBuffer)
        }

        throw new GApiError( 400, 'Unsupported export format');
    }

}