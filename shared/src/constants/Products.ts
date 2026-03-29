import { Product } from "../models/Product";

export const PRODUCTS: Product[] = [
    {
        id: 'reference-card',
        displayName: 'VFR / IFR Reference Card',
        description: 'VFR Side: Cloud Clearance, Flight Categories, VFR Altitudes, Definition of Night, Lost Comms, Quick Reference. IFR Side: IFR Alternate, IFR Lost Comms, IFR Reporting, Service Volumes and Supplemental Oxygen.',
        price: 9.99,
        priceIdEnvVar: 'STRIPE_PRODUCT_REFCARD_PRICE',
        images: ['/thumbnails/reference-0.png', '/thumbnails/reference-1.png'],
        freeCoupons: ['REF-CARD-FEB-2026'],
        showInStore: true
    },
    {
        id: 'seattle-ga-airports',
        displayName: 'Seattle GA Airports',
        description: 'Front: Arlington (KAWO), Auburn (S50), Boeing Field (KBFI), Bremerton (KPWT), Harvey (S43), Normal Grier (S36). Back: Olympia (KOLM), Paine (KPAE), Pierce (KPLU), Renton (KRNT), Skagit (KBVS), Tacoma (KTIW)',
        price: 9.99,
        priceIdEnvVar: 'STRIPE_PRODUCT_SEATTLE_GA_PRICE',
        images: ['/thumbnails/seattle-ga-0.png', '/thumbnails/seattle-ga-1.png'],
        freeCoupons: [],
        showInStore: true
    },
    {
        id: 'socal-ga-airports',
        displayName: 'SoCal GA Airports',
        description: 'Front: French Valley (F70), Catalina (KAVX), Camarillo (KVMA), Chino (KCNO), Santa Ynez (KIZA), Oceano County (L52). Back: Long Beach (KLGB), Gillespie (KSEE), Santa Monica (KSMO), Zamperini (KTOA), Van Nuys (KNVY), Big Bear (L35)',
        price: 9.99,
        priceIdEnvVar: 'STRIPE_PRODUCT_SOCAL_GA_PRICE',
        images: ['/thumbnails/socal-ga-0.png', '/thumbnails/socal-ga-1.png'],
        freeCoupons: [],
        isNew: true,
        showInStore: true
    },
    {
        id: 'runway-key-chain',
        displayName: 'Runway Key Chain',
        description: '3D printed Runway with a keychain ring. Dimensions: 1in x 4.75in.',
        price: 6.99,
        priceIdEnvVar: 'STRIPE_PRODUCT_KEYCHAIN_PRICE',
        images: [],
        freeCoupons: [],
        showInStore: false
    }
];
