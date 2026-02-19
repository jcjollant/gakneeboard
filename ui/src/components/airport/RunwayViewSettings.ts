import { Runway } from "../../models/Airport";
import { RunwayOrientation } from "./RunwayOrientation";
import { TrafficPatternDisplay } from "../../models/TrafficPatternDisplay";

export class RunwayViewSettings {
    static defaultOrientation: string = 'vertical'
    runway: Runway | undefined
    patternMode: TrafficPatternDisplay
    orientation: RunwayOrientation
    label: string | undefined
    headings: boolean

    constructor(runway: Runway | undefined = undefined, patternMode: TrafficPatternDisplay = TrafficPatternDisplay.Downwind, orientation: RunwayOrientation = RunwayOrientation.Vertical, label: string | undefined = undefined, headings: boolean = true) {
        this.runway = runway
        this.patternMode = patternMode
        this.orientation = orientation
        this.label = label
        this.headings = headings
    }
}