import { DisplayModeAirport, DisplayModeChoice } from "../../models/DisplayMode";
import { RunwayOrientation } from "./RunwayOrientation";
import { TrafficPatternDisplay } from "../../models/TrafficPatternDisplay";

export class AirportTileConfig {
  static modesList = [
    new DisplayModeChoice('Runway Sketch', DisplayModeAirport.RunwaySketch, true, "Simplified vue of runway(s) with airport data", '/tiles/airport-sketch.png'),
    new DisplayModeChoice('Mini Diagram', DisplayModeAirport.Diagram, true, "Small Airport Diagram with airport data", "/tiles/airport-diagram.png"),
    new DisplayModeChoice('Chart Links', DisplayModeAirport.Charts, true, "List of available charts (Diagram, Notices, Approaches)", "/tiles/airport-diagram.png"), // Placeholder icon
  ];

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
    pattern: TrafficPatternDisplay = TrafficPatternDisplay.Downwind,

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
