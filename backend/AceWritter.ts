import { BlockList } from "net";
import { Crc32 } from "./Crc32";

enum AceType {
    WARNING = 0x77, // w
    ATTENTION = 0x61, // a
    NOTE = 0x6e, // n
    PLAIN = 0x70, // p
    CHALLENGE = 0x63, // c
    RESPONSE = 0x72, // r
    TITLE = 0x74 // t
}

enum AceIdent {
    LEFT = 0x30, // 0
    ONE = 0x31, // 1
    TWO = 0x32, // 2
    CENTER = 0x63 // c
}

export class AceItem {
    challenge:string
    response:string|undefined
    type:number
    ident:number
    constructor(challenge:string, response:string|undefined, type:AceType, ident:AceIdent) {
        this.challenge = challenge
        this.response = response
        this.type = type
        this.ident = ident
    }
}

export class AceList {
    name:string
    items:AceItem[]
    constructor(name:string) {
        this.name = name
        this.items = []
    }
}

export class AceGroup {
    name:string
    lists:AceList[]
    constructor(name:string) {
        this.name = name
        this.lists = []
    }
}

export class AceChecklist {
    filename:string
    makeAndModel:string
    aircraft:string
    manufacturer:string
    copyright:string
    groups:AceGroup[]
}

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
        const checklist:AceChecklist = new AceChecklist()
        checklist.filename = 'Demo FileName'
        checklist.makeAndModel = 'Demo Make and Model'
        checklist.aircraft = 'Demo Aircraft'
        checklist.manufacturer = 'Demo Manufacturer'
        checklist.copyright = 'Demo Copyright'
        const group:AceGroup = new AceGroup('Demo Group')
        const list:AceList = new AceList('Demo Checklist')
        const item1:AceItem = new AceItem('One', undefined, AceType.PLAIN, AceIdent.LEFT)
        const item2:AceItem = new AceItem('Two', undefined, AceType.PLAIN, AceIdent.ONE)
        const item3:AceItem = new AceItem('Three', undefined, AceType.PLAIN, AceIdent.TWO)
        const item4:AceItem = new AceItem('Centered', undefined, AceType.PLAIN, AceIdent.CENTER)
        const item5:AceItem = new AceItem('Challenge', 'Response', AceType.RESPONSE, AceIdent.LEFT)
        list.items = [item1, item2, item3, item4, item5]
        group.lists = [list]
        checklist.groups = [group]
        
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