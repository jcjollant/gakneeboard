import { DisplayModeVfr } from "../../models/DisplayMode";

export class VfrTileConfig {
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
