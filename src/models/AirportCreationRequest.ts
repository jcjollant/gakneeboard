import { Frequency } from "./Frequency";
import { Runway } from "./Airport";

export interface AirportCreationRequest {
    code: string;
    name: string;
    elevation: number;
    trafficPatternAltitude: number | undefined;
    frequencies: Frequency[];
    runways: Runway[];
}
