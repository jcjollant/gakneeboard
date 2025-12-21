import { ChecklistItem, ChecklistTheme } from "./Checklist";

export class ChecklistTile {
    name: string;
    items: ChecklistItem[];
    theme: ChecklistTheme;

    constructor(name: string = 'Checklist', items: ChecklistItem[] = [], theme: ChecklistTheme = ChecklistTheme.blue) {
        this.name = name;
        this.items = items;
        this.theme = theme;
    }
}