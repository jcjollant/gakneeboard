export interface Station {
    name: string;
    posInch: number;
}

export interface CgLimit {
    posInch: number;
    weightLbs: number;
}

export interface AircraftData {
    climbFuel: number;
    cruiseFuel: number;
    descentFuel: number;
    cruiseTas: number;
    climbTas: number;
    basicEmptyCg: number;
    basicEmptyWeight: number;
    maxRampWeight: number;
    maxTakeoffWeight: number;
    maxLandingWeight: number;
    stations: Station[];
    fwdCgLimits: CgLimit[];
    aftCgLimits: CgLimit[];
}

export interface Aircraft {
    id: number;
    userId: number;
    tailNumber: string;
    make: string;
    model: string;
    data: AircraftData;
}
