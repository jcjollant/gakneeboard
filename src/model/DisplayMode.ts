export class DisplayModeChoice {
    label:string;
    value:string;
}

export enum DisplayModeNotes {
    Unknown = '?',
    Blank = '',
    Grid = 'grid',
    Compass = 'compass',
    Craft = 'craft',
}

export enum DisplayModeIfr {
    Approach = 'apch',
    BoxV = 'boxV',
    BoxH_deprecated = 'boxH',
    Departure = 'dep',
    Craft_deprecated = 'craft',
    Hold = 'hold',
}
