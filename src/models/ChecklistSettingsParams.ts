import { Checklist, ChecklistFont, ChecklistTheme } from './Checklist';
import { DisplayModeChecklist } from './DisplayMode';

export class ChecklistSettingsParams {
    name: string;
    lists: Checklist[];
    theme: ChecklistTheme;
    font: ChecklistFont;
    isTile: boolean;
    displayMode: DisplayModeChecklist;

    constructor(
        name: string = '',
        lists: Checklist[] = [],
        theme: ChecklistTheme = ChecklistTheme.yellow,
        font: ChecklistFont = ChecklistFont.medium,
        isTile: boolean = false,
        displayMode: DisplayModeChecklist = DisplayModeChecklist.Full
    ) {
        this.name = name;
        this.lists = lists;
        this.theme = theme;
        this.font = font;
        this.isTile = isTile;
        this.displayMode = displayMode;
    }
}
