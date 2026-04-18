export interface Station {
    name: string;
    posInch: number;
}

export interface CgLimit {
    posInch: number;
    weightLbs: number;
}

export interface Speeds {
    vs0: number;
    vs1: number;
    vfe: number;
    va: number;
    vno: number;
    vne: number;
}

export interface AircraftData {
    make: string;
    model: string;
    icon?: string;
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
    maxUsableFuel: number;
    stations: Station[];
    fwdCgLimits: CgLimit[];
    aftCgLimits: CgLimit[];
    speed: Speeds;
}

export interface Aircraft {
    id: number;
    userId: number;
    tailNumber: string;
    data: AircraftData;
}
