import { GApiError } from "../GApiError";
import { SimplifiedNotam, NotamType } from "@checklist/shared";
import { NotamDecoder } from "./NotamDecoder";

export enum NotamClassification {
    INTERNATIONAL = 'INTERNATIONAL',
    MILITARY = 'MILITARY',
    LOCAL_MILITARY = 'LOCAL_MILITARY',
    DOMESTIC = 'DOMESTIC',
    FDC = 'FDC'
}

export enum NotamFeature {
    RWY = 'RWY', TWY = 'TWY', APRON = 'APRON', AD = 'AD', OBST = 'OBST',
    NAV = 'NAV', COM = 'COM', SVC = 'SVC', AIRSPACE = 'AIRSPACE',
    ODP = 'ODP', SID = 'SID', STAR = 'STAR', CHART = 'CHART',
    DATA = 'DATA', DVA = 'DVA', IAP = 'IAP', VFP = 'VFP',
    ROUTE = 'ROUTE', SPECIAL = 'SPECIAL', SECURITY = 'SECURITY'
}

export enum NmsResponseFormat {
    AIXM = 'AIXM',
    GEOJSON = 'GEOJSON'
}

export interface NmsTime {
    /** Time created as yyyy-MM-ddTHH:mm:ssZ */
    timestamp: string;
}

export interface NmsNotamResponse {
    status: string;
    errors?: any[];
    data: {
        aixm?: string[];
        geojson?: any[];
        url?: string;
    }
}

export interface NmsInitialLoadResponse {
    status: string;
    errors?: any[];
    data: {
        url: string;
    }
}

export interface NmsChecklistResponse {
    status: string;
    errors?: any[];
    data: {
        checklist: any[];
    }
}

export interface GetNotamsParams {
    nmsResponseFormat: NmsResponseFormat;
    accountability?: string;
    allowRedirect?: boolean;
    classification?: NotamClassification;
    effectiveEndDate?: string;
    effectiveStartDate?: string;
    feature?: NotamFeature;
    freeText?: string;
    nmsId?: string;
    lastUpdatedDate?: string;
    latitude?: number;
    location?: string;
    longitude?: number;
    notamNumber?: string;
    radius?: number;
}

import { ApiCallDao, ApiName } from "../dao/ApiCallDao";

export class NotamService {
    private static token: string | undefined = undefined;
    private static tokenExpiry: number = 0;

    private static getUrl(): string {
        const url = process.env.NMS_API_URL;
        if (!url) throw new Error("NMS_API_URL not configured");
        return url;
    }

    private static getAuthCredentials() {
        const clientId = process.env.NMS_API_KEY;
        const clientSecret = process.env.NMS_API_SECRET;
        if (!clientId || !clientSecret) throw new Error("NMS_API_KEY or NMS_API_SECRET not configured");
        return { clientId, clientSecret };
    }

    private static async getAuthToken(): Promise<string> {
        if (this.token && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        const { clientId, clientSecret } = this.getAuthCredentials();
        const baseUrl = this.getUrl();

        // The NMS API documentation implies the auth endpoint is at the root /v1/auth/token path, relative to the host.
        // NMS_API_URL includes the /nmsapi context path, so we use the origin.
        const urlObj = new URL(baseUrl);
        const authUrl = `${urlObj.origin}/v1/auth/token`;

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');

        // Basic auth is usually user:pass base64 encoded for -u in curl, 
        // OR sometimes it's client_id/secret params. 
        // Curl example uses -u <CLIENT_ID>:<CLIENT_SECRET> which implies Basic Auth header.
        const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        try {
            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader
                },
                body: params
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to get token: ${response.status} ${text}`);
            }

            const data = await response.json();
            // Expecting access_token and expires_in
            this.token = data.access_token;
            // Set expiry 60 seconds before actual expiry to be safe
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
            return this.token!;
        } catch (error) {
            console.error("Error authenticating with NMS:", error);
            throw error;
        }
    }

    private static async fetchWithAuth(endpoint: string, options: RequestInit = {}, code?: string): Promise<any> {
        const token = await this.getAuthToken();
        const url = `${this.getUrl()}${endpoint}`;

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            // Handle 401 specifically if token expired mid-operation? 
            // For now, simpler error handling.
            const text = await response.text();
            throw new GApiError(response.status, `NMS API Error: ${text}`);
        }

        const data = await response.json();

        // Record usage
        try {
            const dataLength = JSON.stringify(data).length;
            // Use provided code or try to infer from endpoint? 
            // Better to rely on caller providing meaningful code.
            const codeToRecord = code || 'unknown';
            ApiCallDao.save(ApiName.Nms, codeToRecord, dataLength);
        } catch (e) {
            console.error('[NotamService] Failed to record usage', e);
        }

        return data;
    }

    public static async getNotams(params: GetNotamsParams): Promise<NmsNotamResponse> {
        const query = new URLSearchParams();
        if (params.accountability) query.append('accountability', params.accountability);
        if (params.allowRedirect !== undefined) query.append('allowRedirect', String(params.allowRedirect));
        if (params.classification) query.append('classification', params.classification);
        if (params.effectiveEndDate) query.append('effectiveEndDate', params.effectiveEndDate);
        if (params.effectiveStartDate) query.append('effectiveStartDate', params.effectiveStartDate);
        if (params.feature) query.append('feature', params.feature);
        if (params.freeText) query.append('freeText', params.freeText);
        if (params.nmsId) query.append('nmsId', params.nmsId);
        if (params.lastUpdatedDate) query.append('lastUpdatedDate', params.lastUpdatedDate);
        if (params.latitude) query.append('latitude', String(params.latitude));
        if (params.location) query.append('location', params.location);
        if (params.longitude) query.append('longitude', String(params.longitude));
        if (params.notamNumber) query.append('notamNumber', params.notamNumber);
        if (params.radius) query.append('radius', String(params.radius));

        const headers: Record<string, string> = {};
        if (params.nmsResponseFormat) {
            headers['nmsResponseFormat'] = params.nmsResponseFormat;
        }

        return this.fetchWithAuth(`/notams?${query.toString()}`, {
            method: 'GET',
            headers
        }, params.location || params.nmsId || params.notamNumber || 'query');
    }

    public static async getSimplifiedNotams(params: Omit<GetNotamsParams, 'nmsResponseFormat'>): Promise<SimplifiedNotam[]> {
        const response = await this.getNotams({
            ...params,
            nmsResponseFormat: NmsResponseFormat.GEOJSON
        });

        if (response.status === 'Success' && response.data.geojson) {
            return response.data.geojson
                .map((f: any) => this.simplify(f))
                .filter((n: any) => n !== null) as SimplifiedNotam[];
        }

        return [];
    }

    public static async getInitialLoad(classification?: NotamClassification, allowRedirect?: boolean): Promise<NmsInitialLoadResponse> {
        const query = new URLSearchParams();
        if (allowRedirect !== undefined) query.append('allowRedirect', String(allowRedirect));

        let endpoint = '/notams/il';
        if (classification) {
            endpoint += `/${classification}`;
        }

        if (query.toString()) {
            endpoint += `?${query.toString()}`;
        }

        return this.fetchWithAuth(endpoint, {
            method: 'GET'
        }, classification || 'initial-load');
    }

    public static async getChecklist(params: { accountability?: string, classification?: NotamClassification, location?: string }): Promise<NmsChecklistResponse> {
        const query = new URLSearchParams();
        if (params.accountability) query.append('accountability', params.accountability);
        if (params.classification) query.append('classification', params.classification);
        if (params.location) query.append('location', params.location);

        return this.fetchWithAuth(`/notams/checklist?${query.toString()}`, {
            method: 'GET'
        }, params.location || 'checklist');
    }

    public static async getLocationSeries(lastUpdatedDate?: string): Promise<any> {
        const query = new URLSearchParams();
        if (lastUpdatedDate) query.append('lastUpdatedDate', lastUpdatedDate);
        return this.fetchWithAuth(`/locationseries?${query.toString()}`, {
            method: 'GET'
        }, 'location-series');
    }

    public static simplify(item: any): SimplifiedNotam | null {
        // Handle GeoJSON format
        if (item.type === 'Feature' && item.properties && item.properties.coreNOTAMData && item.properties.coreNOTAMData.notam) {
            const notam = item.properties.coreNOTAMData.notam;
            // Decoded text from raw text as per user request
            const plainText = NotamDecoder.decode(notam.text);

            // Determine type
            let type = NotamType.Other;
            if (notam.selectionCode) {
                type = this.getTypeFromQCode(notam.selectionCode);
            } else if (notam.classification === 'FDC') {
                // Often FDC notams are procedure changes, but not always. 
                // We'll rely on text parsing if Q-code is missing, or default to Procedure if it looks like one.
                if (notam.text && (notam.text.includes('IAP') || notam.text.includes('ODP') || notam.text.includes('SID') || notam.text.includes('STAR'))) {
                    type = NotamType.Procedure;
                }
            }

            return {
                id: notam.number,
                type: type,
                effectiveStart: notam.effectiveStart,
                effectiveEnd: notam.effectiveEnd,
                text: notam.text,
                plainText: plainText
            };
        }

        // Handle AIXM format (if we decide to support simplification for it, usually XML based but converted to JSON?)
        // The API returns AIXM 5.1 which is complex. For now, we focus on GeoJSON support as primary.
        return null;
    }

    private static getTypeFromQCode(qcode: string): NotamType {
        if (!qcode || qcode.length < 5) return NotamType.Other;

        // Q-code structure: Q[Subject][Condition]...
        // 2nd and 3rd letters are the Subject.
        const subject = qcode.substring(1, 3);

        // Mappings based on common NOTAM Q-codes
        // A* = Airspace Organization
        // C* = Communications
        // F* = Facilities
        // I* = Instrument Landing System
        // L* = Lighting
        // M* = Movement and Landing Area
        // N* = Terminal and En-route Navigation Facilities
        // O* = Other Information
        // P* = Air Traffic Procedures
        // R* = Airspace Restrictions
        // S* = Electronic Aids, Surveillance, etc.
        // W* = Warnings

        if (subject.startsWith('P')) return NotamType.Procedure; // Procedures (IAP, SID, STAR)
        if (subject === 'OB') return NotamType.Obstruction; // Obstacles
        if (subject === 'OL') return NotamType.Obstruction; // Obstacles (Lights included sometimes)
        if (subject.startsWith('M')) return NotamType.Service; // Review: Movement area often closures -> Service/facility status? Or separate 'Aerodrome'?
        if (subject.startsWith('L') || subject.startsWith('I') || subject.startsWith('N') || subject.startsWith('C')) return NotamType.Service;
        if (subject.startsWith('R') || subject.startsWith('W') || subject.startsWith('A')) return NotamType.Airspace;

        // Specific checks for LTA (Letters to Airmen)? 
        // LTA isn't a standard Q-code subject. It's usually a different classification or scenario.

        return NotamType.Other;
    }
}
