import { ChecklistFont, ChecklistItem, ChecklistTheme } from "./Checklist";

export class ChecklistPage {
    name: string;
    items: ChecklistItem[]
    items2: ChecklistItem[] | undefined
    items3: ChecklistItem[] | undefined
    theme: ChecklistTheme;
    font: ChecklistFont;

    constructor(name: string = 'Checklist') {
        this.name = name;
        this.items = []
        this.items2 = undefined
        this.items3 = undefined
        this.theme = ChecklistTheme.blue
        this.font = ChecklistFont.medium
    }
}