import { DisplayModeAirport } from "../../model/DisplayMode"

export class AirportTileConfig {
    code: string
    rwys: string[]
    pattern: number
    corners: string[]
    rwyOrientation: string
    headings: boolean
    mode: DisplayModeAirport
}
