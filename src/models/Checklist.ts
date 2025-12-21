
export class Checklist {
    items: ChecklistItem[];

    constructor(items: ChecklistItem[] = []) {
        this.items = items;
    }
}

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

export enum ChecklistTheme {
    blue = 'blue',
    green = 'green',
    grey = 'grey',
    purple = 'purple',
    red = 'red',
    yellow = 'yellow',
}

export enum ChecklistFont {
    smaller = 'smaller',
    small = 'small',
    medium = 'medium',
    large = 'large',
    larger = 'larger',
}