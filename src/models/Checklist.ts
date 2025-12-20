import { Static } from "vue";

export class ChecklistItem {
    challenge: string;
    response: string;
    section: string;
    type: ChecklistItemType;

    constructor(challenge: string = '', response: string = '', section: string = '', type: ChecklistItemType = ChecklistItemType.undefined) {
        this.challenge = challenge || '';
        this.response = response || '';
        this.section = section || '';
        this.type = type || ChecklistItemType.undefined;
    }
    static alternate() {
        return new ChecklistItem('', '', '', ChecklistItemType.alternate)
    }
    static blank() {
        return new ChecklistItem('', '', '', ChecklistItemType.blank)
    }
    static section(name: string, type: ChecklistItemType = ChecklistItemType.undefined) {
        return new ChecklistItem('', '', name, type)
    }
}

export enum ChecklistItemType {
    blank = 'blank',
    alternate = 'alt',
    emergent = 'emer', // Section
    strong = 'strong', // Section
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