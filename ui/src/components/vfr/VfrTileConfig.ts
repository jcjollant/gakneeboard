import { DisplayModeChoice, DisplayModeVfr } from "../../models/DisplayMode";

export class VfrTileConfig {
    static modesList = [
        new DisplayModeChoice('VFR Departure', DisplayModeVfr.Departure, true, undefined, undefined, 'D'),
        new DisplayModeChoice('VFR Altitudes', DisplayModeVfr.Altitudes, true, undefined, undefined, 'A'),
        new DisplayModeChoice('Cloud Clearance', DisplayModeVfr.CloudClearance, true, undefined, undefined, 'C'),
        new DisplayModeChoice('Sunlight', DisplayModeVfr.Sunlight, true, undefined, undefined, 'S'),
        new DisplayModeChoice('Lost Comms', DisplayModeVfr.LostComms, true, undefined, undefined, 'L'),
    ];

    mode: DisplayModeVfr;
    from?: string;
    to?: string;
    date?: Date;
    night?: boolean;
    fromRouteCode?: string;
    toRouteCode?: string;
    sunlight?: any;

    constructor(mode: DisplayModeVfr = DisplayModeVfr.Unknown) {
        this.mode = mode;
    }
}
