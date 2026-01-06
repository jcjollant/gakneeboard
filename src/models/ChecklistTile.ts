import { ChecklistItem, ChecklistTheme } from "./Checklist";
import { DisplayModeChecklist } from "./DisplayMode";

export class ChecklistTile {
    name: string;
    items: ChecklistItem[];
    theme: ChecklistTheme;
    displayMode: DisplayModeChecklist;

    constructor(name: string = 'Checklist', items: ChecklistItem[] = [], theme: ChecklistTheme = ChecklistTheme.blue, displayMode: DisplayModeChecklist = DisplayModeChecklist.Full) {
        this.name = name;
        this.items = items;
        this.theme = theme;
        this.displayMode = displayMode;
    }
}