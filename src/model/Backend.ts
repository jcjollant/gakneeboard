export interface Backend {
    version: string;
    promise: Promise<Backend>;
    airportModelVersion: number;
    airportEffectiveDate: number;
    ready: boolean;
}
