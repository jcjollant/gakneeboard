import { Checklist, ChecklistFont, ChecklistTheme } from './Checklist';

export class ChecklistSettingsParams {
    name: string;
    lists: Checklist[];
    theme: ChecklistTheme;
    font: ChecklistFont;
    isTile: boolean;

    constructor(
        name: string = '',
        lists: Checklist[] = [],
        theme: ChecklistTheme = ChecklistTheme.yellow,
        font: ChecklistFont = ChecklistFont.medium,
        isTile: boolean = false
    ) {
        this.name = name;
        this.lists = lists;
        this.theme = theme;
        this.font = font;
        this.isTile = isTile;
    }
}
