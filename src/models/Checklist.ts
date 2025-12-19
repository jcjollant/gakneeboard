import { Static } from "vue";

export class ChecklistItem {
    challenge: string;
    response: string;
    section: string;
    type: ItemType;

    constructor(challenge: string = '', response: string = '', section: string = '', type: ItemType = ItemType.undefined) {
        this.challenge = challenge || '';
        this.response = response || '';
        this.section = section || '';
        this.type = type || ItemType.undefined;
    }
    static alternate() {
        return new ChecklistItem('', '', '', ItemType.alternate)
    }
    static blank() {
        return new ChecklistItem('', '', '', ItemType.blank)
    }
    static section(name: string, type: ItemType = ItemType.undefined) {
        return new ChecklistItem('', '', name, type)
    }
}

export enum ItemType {
    blank = 'blank',
    alternate = 'alt',
    emergent = 'emer',
    strong = 'strong',
    undefined = '',
}

export class Checklist {
    items: ChecklistItem[];

    static EMERGENT = 'emer'
    static STRONG = 'strong'

    constructor() {
        this.items = []
    }

    static empty() {
        return new Checklist()
    }

}