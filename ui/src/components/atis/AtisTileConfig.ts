import { DisplayModeAtis, DisplayModeChoice } from "../../models/DisplayMode";
import { AtisTileDisplayModeLabels } from "./AtisTileDisplayModeLabel";

export class AtisTileConfig {
    static modesList = [
        new DisplayModeChoice(AtisTileDisplayModeLabels.fullATIS, DisplayModeAtis.FullATIS, true, undefined, undefined, 'B'),
        new DisplayModeChoice(AtisTileDisplayModeLabels.compactATIS, DisplayModeAtis.CompactATIS, true, undefined, undefined, 'C'),
        new DisplayModeChoice(AtisTileDisplayModeLabels.categories, DisplayModeAtis.Categories, true, undefined, undefined, 'F'),
    ];

    mode: DisplayModeAtis;
    lines: number;
    showWatermarks: boolean;

    constructor(
        mode: DisplayModeAtis = DisplayModeAtis.FullATIS,
        lines: number = 5,
        showWatermarks: boolean = true
    ) {
        this.mode = mode;
        this.lines = lines;
        this.showWatermarks = showWatermarks;
    }
}
