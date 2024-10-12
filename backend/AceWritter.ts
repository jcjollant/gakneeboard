import { Crc32 } from "./Crc32";
import { AceChecklist, AceType } from "./models/AceChecklist";
import { Template } from "./models/Template";

export class AceWritter {
    static FILE_START = Uint8Array.from([0xf0, 0xf0, 0xf0, 0xf0, 0x0, 0x1]);
    static FILE_STOP = Uint8Array.from([0x45, 0x4e, 0x44, 0x0d, 0x0a]) // 'END\r\n'
    // Default group index, default checklist index
    static DEFAULT = Uint8Array.from([0x0, 0x0, 0x0d, 0x0a])
    static NEWLINE = Uint8Array.from([0x0d, 0x0a])
    static GROUP_START = Uint8Array.from([0x3c, 0x30]); // '<0'
    static GROUP_STOP = Uint8Array.from([0x3e, 0x0d, 0x0a]) // '>\r\n'
    static LIST_START = Uint8Array.from([0x28, 0x30]) // '(0'
    static LIST_STOP = Uint8Array.from([0x29, 0x0d, 0x0a]) // ')\r\n'

    static addString(parts:BlobPart[], text:string) {
        parts.push(text)
        parts.push(AceWritter.NEWLINE)
    }

    public static async demo():Promise<ArrayBuffer> {
        const checklist:AceChecklist = AceChecklist.getDemo()
        return AceWritter.write(checklist)
    }

    public static async fromTemplate(template:Template):Promise<ArrayBuffer> {
        const checklist:AceChecklist = AceChecklist.fromTemplate(template)
        return AceWritter.write(checklist)
    }

    public static async write(checklist:AceChecklist):Promise<ArrayBuffer> {
        const parts:BlobPart[] = []
        parts.push( AceWritter.FILE_START)
        parts.push( AceWritter.DEFAULT)
        // Name
        parts.push( checklist.filename)
        parts.push( AceWritter.NEWLINE)
        // Make and Model
        parts.push( checklist.makeAndModel)
        parts.push( AceWritter.NEWLINE)
        // Aircraft Info
        parts.push( checklist.aircraft)
        parts.push( AceWritter.NEWLINE)
        // Manufacturer Info
        parts.push( checklist.manufacturer)
        parts.push( AceWritter.NEWLINE)
        // Copyright Info
        parts.push( checklist.copyright)
        parts.push( AceWritter.NEWLINE)

        // 3 nested loops Groups / Lists / Items
        for(const group of checklist.groups) {
            parts.push( AceWritter.GROUP_START)
            parts.push( group.name)
            parts.push( AceWritter.NEWLINE)
            for( const list of group.lists) {
                parts.push( AceWritter.LIST_START)
                parts.push( list.name)
                parts.push( AceWritter.NEWLINE)
                for( const item of list.items) {
                    // Type an Position
                    parts.push( Uint8Array.from([item.type, item.ident]))
                    if(item.type == AceType.RESPONSE) {
                        parts.push( item.challenge + '~' + item.response)
                    } else {
                        parts.push( item.challenge)
                    }
                    parts.push( this.NEWLINE)
                }
                parts.push( AceWritter.LIST_STOP)
            }
            parts.push( AceWritter.GROUP_STOP)
        }

        parts.push( AceWritter.FILE_STOP)

        // add crc 32
        const crcBlob = new Blob(parts)
        const crcArray = new Uint8Array(await crcBlob.arrayBuffer())
        const crc32 = Crc32.computeArray( crcArray) 
        parts.push( crc32)

        const blob = new Blob(parts, {type: 'application/octet-stream'})
        return await blob.arrayBuffer()
    }


}