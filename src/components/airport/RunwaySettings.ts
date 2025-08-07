import { Runway } from "../../model/Airport";

export class RunwaySettings {
    static defaultOrientation:string = 'vertical'
    runway: Runway|undefined
    patternMode: number
    orientation: string
    label: string
    headings: boolean

    constructor(runway:Runway|undefined = undefined, patternMode:number = 0, orientation:string = RunwaySettings.defaultOrientation, label:string = '', headings:boolean = true) {
        this.runway = runway
        this.patternMode = patternMode
        this.orientation = orientation
        this.label = label
        this.headings = headings
    }
}