export class DisplayModeChoice {
    label:string;
    value:string;
    expandable:boolean;
    description:string;
    constructor(label:string, value:string, expandable:boolean = false, description:string = '') {
        this.label = label;
        this.value = value;
        this.expandable = expandable;
        this.description = description;
    }
}

export enum DisplayModeAirport {
    RunwaySketch = 'one',
    // FourRunways = 'four',
    // RunwayList = 'list',
    Diagram = 'diag',
}

export enum DisplayModeNotes {
    Unknown = '?',
    Blank = '',
    Grid = 'grid',
    Compass = 'compass',
    Craft_deprecated = 'craft',
    Word = 'word',
}

export enum DisplayModeIfr {
    Approach = 'apch',
    Alternate = 'alt',
    BoxV = 'boxV',
    BoxH_deprecated = 'boxH',
    Departure = 'dep',
    Craft_deprecated = 'craft',
    Hold_deprecated = 'hold',
}

export enum DisplayModeAtis {
    FullATIS = '',
    CompactATIS = 'compact',
    Categories = 'categories',
    CloudClearance = 'cloudCLear',
}

export enum DisplayModeRadios {
    FreqList = '',
    LostComms = 'nordo',
    ServiceVolumes = 'sv',
}
