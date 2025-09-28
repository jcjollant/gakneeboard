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
    Unknown = '?',
    Approach = 'apch',
    Alternate = 'alt',
    BoxV = 'boxV',
    BoxH_deprecated = 'boxH',
    Departure = 'dep',
    Craft_deprecated = 'craft',
    Hold_deprecated = 'hold',
    LostComms = 'lostcomms',
}

export enum DisplayModeSunlight {
    Unknown = '?',
    Flight = 'flight',
    Reference = 'ref',
}

export enum DisplayModeVfr {
    Unknown = '?',
    Altitudes = 'alt',
    CloudClearance = 'clouds',
    LostComms = 'nordo',
}


export enum DisplayModeAtis {
    Unknown = '?',
    FullATIS = '',
    CompactATIS = 'compact',
    Categories = 'categories',
    CloudClearance = 'cloudCLear',
}

export enum DisplayModeRadios {
    Unknown = '?',
    FreqList = '',
    LostComms = 'nordo',
    LostCommsIFR = 'lost-comms-ifr',
    ServiceVolumes = 'sv',
}
