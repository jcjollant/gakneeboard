import { DisplayModeAirport } from "../../models/DisplayMode";
import { RunwayOrientation } from "./RunwayOrientation";
import { TrafficPatternDisplay } from "../../models/TrafficPatternDisplay";

export class AirportTileConfig {
  code: string;
  rwys: string[];
  pattern: TrafficPatternDisplay;
  corners: string[];
  rwyOrientation: RunwayOrientation;
  headings: boolean;
  mode: DisplayModeAirport;
  showMetar: boolean;
  showNotams: boolean;

  constructor(
    code: string = "",
    rwys: string[] = [],
    pattern: TrafficPatternDisplay = TrafficPatternDisplay.Entry45,

    corners: string[] = [],
    rwyOrientation: RunwayOrientation = RunwayOrientation.Vertical,
    headings: boolean = true,
    mode: DisplayModeAirport = DisplayModeAirport.RunwaySketch,
    showMetar: boolean = true,
    showNotams: boolean = true
  ) {
    this.code = code;
    this.rwys = rwys;
    this.pattern = pattern;
    this.corners = corners;
    this.rwyOrientation = rwyOrientation;
    this.headings = headings;
    this.mode = mode;
    this.showMetar = showMetar;
    this.showNotams = showNotams;
  }
}
