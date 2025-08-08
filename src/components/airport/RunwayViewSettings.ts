import { Runway } from "../../model/Airport";

export class RunwayViewSettings {
    static defaultOrientation:string = 'vertical'
    runway: Runway|undefined
    patternMode: number
    orientation: string
    label: string|undefined
    headings: boolean

    constructor(runway:Runway|undefined = undefined, patternMode:number = 0, orientation:string = RunwayViewSettings.defaultOrientation, label:string|undefined = undefined, headings:boolean = true) {
        this.runway = runway
        this.patternMode = patternMode
        this.orientation = orientation
        this.label = label
        this.headings = headings
    }
}