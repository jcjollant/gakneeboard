import { Product } from "../models/Product";

export const PRODUCTS: Product[] = [
    {
        id: 'ref-card-lam',
        displayName: 'Laminated Reference Card',
        description: 'Durable, high-quality laminated reference card for cockpit use.',
        price: 9.99,
        priceIdEnvVar: 'STRIPE_PRODUCT_REFCARD_PRICE',
        images: ['/products/ref-card-front.png'],
        freeCoupons: ['REF-CARD-FEB-2026']
    }
];
