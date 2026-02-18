import { DisplayModeChoice, DisplayModeIfr } from "../../models/DisplayMode";
import { IfrTileDisplayModeLabels } from "./IfrTileDisplayModeLabel";

export class IfrTileConfig {
    static modesList = [
        new DisplayModeChoice(IfrTileDisplayModeLabels.craft, DisplayModeIfr.BoxV, false, 'Notes with CRAFT elements', '/tiles/ifr-craft.png'),
        new DisplayModeChoice(IfrTileDisplayModeLabels.departure, DisplayModeIfr.Departure, false, 'Notes with DEPARTURE elements', '/tiles/ifr-departure.png'),
        new DisplayModeChoice(IfrTileDisplayModeLabels.appraoch, DisplayModeIfr.Approach, false, 'Notes with APPROACH elements', '/tiles/ifr-approach.png'),
        new DisplayModeChoice(IfrTileDisplayModeLabels.alternate, DisplayModeIfr.Alternate, false, 'IFR Alternate Requirements', '/tiles/ifr-alternate.png'),
        new DisplayModeChoice(IfrTileDisplayModeLabels.lostComms, DisplayModeIfr.LostComms, false, 'IFR Lost Comms Pointers', '/tiles/ifr-lostcomms.png'),
    ]
}