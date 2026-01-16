export interface RequestFrequency {
    name: string;
    mhz: number | undefined;
}

export interface RequestRunway {
    name: string;
    length: number | undefined;
    width: number | undefined;
}

export interface AirportCreationRequest {
    code: string;
    name: string;
    elevation: number;
    trafficPatternAltitude: number | undefined;
    frequencies: RequestFrequency[];
    runways: RequestRunway[];
}
