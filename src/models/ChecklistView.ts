import { ChecklistItem, ChecklistTheme } from "./Checklist";
import { ChecklistFont } from "./Checklist";

export class ChecklistView {
    items: ChecklistItem[];
    font: ChecklistFont;
    theme: ChecklistTheme;

    constructor(items: ChecklistItem[] = [], font: ChecklistFont = ChecklistFont.medium, theme: ChecklistTheme = ChecklistTheme.yellow) {
        this.items = items;
        this.font = font;
        this.theme = theme;
    }
}