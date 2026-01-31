
export interface Metar {
    icaoId: string;
    receiptTime: string;
    obsTime: number;
    reportTime: string;
    temp: number;
    dewp: number;
    wdir: number | string; // Can be VRB
    wspd: number;
    wgst: number;
    visib: number | string; // Can be string for 10+
    altim: number;
    slp: number;
    wxString: string;
    presTend: number;
    maxT: number;
    minT: number;
    maxT24: number;
    minT24: number;
    precip: number;
    pcp3hr: number;
    pcp6hr: number;
    pcp24hr: number;
    snow: number;
    vertVis: number;
    metarType: string;
    rawOb: string;
    clouds: any; // specific cloud structure if needed
    fltCat: string;
}
