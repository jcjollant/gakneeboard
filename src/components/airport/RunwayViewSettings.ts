import { Runway } from "../../models/Airport";
import { RunwayOrientation } from "./RunwayOrientation";

export class RunwayViewSettings {
    static defaultOrientation:string = 'vertical'
    runway: Runway|undefined
    patternMode: number
    orientation: RunwayOrientation
    label: string|undefined
    headings: boolean

    constructor(runway:Runway|undefined = undefined, patternMode:number = 0, orientation:RunwayOrientation = RunwayOrientation.Vertical, label:string|undefined = undefined, headings:boolean = true) {
        this.runway = runway
        this.patternMode = patternMode
        this.orientation = orientation
        this.label = label
        this.headings = headings
    }
}