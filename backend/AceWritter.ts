import { Crc32 } from "./Crc32";

export class AceWritter {
    static HEADER = Uint8Array.from([0xf0, 0xf0, 0xf0, 0xf0, 0x0, 0x1]);
    // Default group index, default checklist index
    static DEFAULT = Uint8Array.from([0x0, 0x0, 0x0d, 0x0a])
    static NEWLINE = Uint8Array.from([0x0d, 0x0a])

    static addString(parts:BlobPart[], text:string) {
        parts.push(text)
        parts.push(AceWritter.NEWLINE)
    }

    public static demo():Blob {
        const parts:BlobPart[] = []
        parts.push( AceWritter.HEADER)
        parts.push( AceWritter.DEFAULT)
        // Name
        AceWritter.addString( parts,"Checklist Name")
        // Make and Model
        AceWritter.addString( parts,"Make and Model")
        // Aircraft Info
        AceWritter.addString( parts,"Aircraft")
        // Manufacturer Info
        AceWritter.addString( parts,"Menufacturer")
        // Copyright Info
        AceWritter.addString( parts,"Copyright")

        // add crc 32
        parts.push( Crc32.compute(Buffer.from(parts)))

        return new Blob(parts, {type: 'application/octet-stream'})
    }


}