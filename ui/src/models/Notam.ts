export interface Notam {
    id?: string;
    type?: string;
    effectiveStart?: string;
    effectiveEnd?: string;
    text: string;
    plainText?: string;
}
