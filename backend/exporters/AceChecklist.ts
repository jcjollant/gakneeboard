import { PageType, Template, Tile } from "../models/Template"

export enum AceType {
    WARNING = 0x77, // w
    ATTENTION = 0x61, // a
    NOTE = 0x6e, // n
    PLAIN = 0x70, // p
    CHALLENGE = 0x63, // c
    RESPONSE = 0x72, // r
    TITLE = 0x74 // t
}

export enum AceIdent {
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
    constructor(challenge:string, response:string|undefined, type:AceType, ident:AceIdent=AceIdent.LEFT) {
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

    static fromTemplate(name:string, data:any):AceList {
        const list = new AceList(name)
        list.items = data.map( item => {
            let emergent:Boolean = false
            if( 't' in item) {
                if( item.t == 'blank') {
                    return new AceItem(' ', undefined, AceType.PLAIN, AceIdent.LEFT)
                }
                if( item.t == 'emer') emergent = true;
            }
            const challenge = 'c' in item ? item.c : 's' in item ? item.s : ' '
            const response = 'r' in item ? item.r : undefined
            const type = 's' in item ? (emergent ? AceType.WARNING : AceType.PLAIN) : 'r' in item ? AceType.RESPONSE : AceType.CHALLENGE
            const identation = 's' in item ? AceIdent.CENTER : AceIdent.LEFT
            return new AceItem(challenge, response, type, identation)
        })
        return list
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

    constructor( 
            filename:string='New Checklist', 
            makeAndModel:string='Aircraft Make and Model', 
            aircraft:string='Aircraft Identification',
            manufacturer:string='Manufacturer Information',
            copyright:string='Copyright Information') {
        this.filename = filename
        this.makeAndModel = makeAndModel
        this.aircraft = aircraft
        this.manufacturer = manufacturer
        this.copyright = copyright
        this.groups = []
    }

    static fromTemplate(template:Template):AceChecklist {
        if(!template) return new AceChecklist()

        // checklist is named after the template
        const checklist = new AceChecklist(template.name)
        // Target structure is Group > List > Item
        // Group is named after template
        const group = new AceGroup(template.name)
        // Checklists can come from pages or tiles which are treated as equal
        // Checklist Name is page or title
        for( const page of template.data) {
            if(page.type == PageType.checklist) {
                if('items2' in page.data) {
                    group.lists.push(AceList.fromTemplate(page.data.name + ' (Left)', page.data.items))
                    group.lists.push(AceList.fromTemplate(page.data.name + ' (Right)', page.data.items2))
                } else {
                    group.lists.push(AceList.fromTemplate(page.data.name, page.data.items))
                }   
            } else if(page.type == PageType.tiles) {
                for(const tile of page.data) {
                    if(tile.name == Tile.checklist) {
                        group.lists.push(AceList.fromTemplate(tile.data.name, tile.data.items))
                    }
                }
            }
        }
        checklist.groups = [group]

        return checklist
    }

    static getDemo():AceChecklist {
        const checklist = new AceChecklist('Demo FileName', 'Demo Make and Model', 'Demo Aircraft', 'Demo Manufacturer', 'Demo Copyright')
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

        return checklist
    }
}
