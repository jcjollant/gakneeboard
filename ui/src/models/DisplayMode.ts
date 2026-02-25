export class DisplayModeChoice {
    label: string;
    value: string;
    expandable: boolean;
    description: string;
    image?: string;
    constructor(label: string, value: string, expandable: boolean = false, description: string = '', image?: string) {
        this.label = label;
        this.value = value;
        this.expandable = expandable;
        this.description = description;
        this.image = image;
    }
}

export enum DisplayModeChecklist {
    Full = 'full',
    Compact = 'compact',
}

export enum DisplayModeAirport {
    RunwaySketch = 'one',
    // FourRunways = 'four',
    // RunwayList = 'list',
    Diagram = 'diag',
    Charts = 'charts',
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
    Sunlight = 'sunlight',
    LostComms = 'nordo',
    Msa = 'msa',
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

export enum DisplayModeRegulations {
    Unknown = '?',
    Night = 'night',
    Oxygen = 'oxygen',
    MinSafeAltitudes = 'msa',
    VfrAltitudes = 'vfr-altitudes',
}
