export interface LoadItem {
    id: string;
    name: string;
    weightLbs: number;
    isPerson: boolean;
}

export interface AssignedLoadItem extends LoadItem {
    stationIndex: number;
    slotIndex?: number;
}

export interface FlightLeg {
    id: string;
    type: 'climb' | 'cruise' | 'descent';
    durationMinutes: number;
}

export interface FuelWorksheetData {
    aircraftTailNumber: string;
    hangarItems: LoadItem[];
    aircraftItems: AssignedLoadItem[];
    flightRules: 'VFR' | 'IFR';
    vfrTime?: 'Day' | 'Night';
    ifrAlternateMinutes: number;
    personalBufferMinutes: number;
    taxiFuelGallons: number;
    fuelGallons: number;
    legs: FlightLeg[];
}
