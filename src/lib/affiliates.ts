
export interface AffiliateConfig {
    attribution: string;
    greeting?: string;
}

export const affiliates: Record<string, AffiliateConfig> = {
    'AirplaneAcademy': {
        attribution: 'source:airplane_academy',
        greeting: 'Welcome Airplane Academy Fans!'
    },
    'TrevorMoody': {
        attribution: 'source:trevor_moody',
        greeting: 'Welcome Trevor Moody Fans!'
    },
    'LewDix': {
        attribution: 'source:lew_dix',
        greeting: 'Welcome Lew Dix Aviation Fans!'
    }
}
