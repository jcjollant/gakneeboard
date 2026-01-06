
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


export const ChecklistThemeColors: Record<ChecklistTheme, { light: string; strong: string; textStrong: string }> = {
    [ChecklistTheme.blue]: { light: '#b4c6e7', strong: 'blue', textStrong: 'white' },
    [ChecklistTheme.green]: { light: '#c6e0b4', strong: 'darkgreen', textStrong: 'white' },
    [ChecklistTheme.grey]: { light: '#e9e9e9', strong: '#666', textStrong: 'white' },
    [ChecklistTheme.purple]: { light: '#E9E', strong: 'purple', textStrong: 'white' },
    [ChecklistTheme.red]: { light: 'pink', strong: 'red', textStrong: 'white' }, // Note: red strong had text-shadow in CSS, handled separately or simplifying? CSS had text-shadow: 2px 2px black.
    [ChecklistTheme.yellow]: { light: 'lightyellow', strong: 'darkorange', textStrong: 'white' },
}