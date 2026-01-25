
export enum NotamType {
    Procedure = 'Procedure',
    Obstruction = 'Obstruction',
    LTA = 'LTA', // Letters to Airmen
    Service = 'Service',
    Airspace = 'Airspace',
    Other = 'Other'
}

export interface SimplifiedNotam {
    id: string;
    type: NotamType;
    effectiveStart: string;
    effectiveEnd: string;
    text: string;
    plainText: string;
}
