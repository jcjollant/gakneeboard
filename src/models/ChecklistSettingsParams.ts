import { Checklist } from './Checklist';

export class ChecklistSettingsParams {
    name: string;
    lists: Checklist[];
    theme: string;
    font: string;
    isTile: boolean;

    constructor(
        name: string = '',
        lists: Checklist[] = [],
        theme: string = 'theme-yellow',
        font: string = 'font-medium',
        isTile: boolean = false
    ) {
        this.name = name;
        this.lists = lists;
        this.theme = theme;
        this.font = font;
        this.isTile = isTile;
    }
}
