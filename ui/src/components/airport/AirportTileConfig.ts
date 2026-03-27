import { DisplayModeAirport, DisplayModeChoice } from "../../models/DisplayMode";
import { RunwayOrientation } from "./RunwayOrientation";
import { TrafficPatternDisplay } from "../../models/TrafficPatternDisplay";
import { RouteCode } from "@gak/shared";

export class AirportTileConfig {
  static modesList = [
    new DisplayModeChoice('Runway Sketch', DisplayModeAirport.RunwaySketch, true, "Simplified vue of runway(s) with airport data", '/tiles/airport-sketch.png'),
    new DisplayModeChoice('Mini Diagram', DisplayModeAirport.Diagram, true, "Small Airport Diagram with airport data", "/tiles/airport-diagram.png"),
    new DisplayModeChoice('Chart Links', DisplayModeAirport.Charts, true, "List of available charts (Diagram, Notices, Approaches)", "/tiles/chart-links.png"),
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
  isSingleSelect: boolean;
  routeCode?: RouteCode;

  constructor(
    code: string = "",
    rwys: string[] = [],
    pattern: TrafficPatternDisplay = TrafficPatternDisplay.Downwind,

    corners: string[] = [],
    rwyOrientation: RunwayOrientation = RunwayOrientation.Vertical,
    headings: boolean = true,
    mode: DisplayModeAirport = DisplayModeAirport.RunwaySketch,
    showMetar: boolean = true,
    showNotams: boolean = true,
    isSingleSelect: boolean = true,
    routeCode: RouteCode | undefined = undefined
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
    this.isSingleSelect = isSingleSelect;
    this.routeCode = routeCode;
  }
}
