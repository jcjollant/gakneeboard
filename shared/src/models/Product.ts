export interface Product {
    id: string;
    displayName: string;
    description: string;
    price: number; // For display
    priceIdEnvVar: string; // Env var name for Stripe Price ID
    images: string[];
    freeCoupons: string[];
}
