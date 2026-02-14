
export enum PrintFormat {
    HALF_LOOSE = 'HALF_LOOSE',
    HALF_RING = 'HALF_RING',
    HALF_SPIRAL = 'HALF_SPIRAL',
    FULL_STD = 'FULL_STD'
}

export enum PrintProductType {
    STANDARD = 'STANDARD',
    CUSTOM = 'CUSTOM'
}

export enum PrintOrderStatus {
    DRAFT = 'DRAFT',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    ABANDONED = 'ABANDONED'
}

export interface PrintOrder {
    id: string;
    userId: string;
    status: PrintOrderStatus;
    amountCents: number;
    stripeSessionId?: string;
    shippingAddress?: any;
    createdAt: Date;
    updatedAt: Date;
    items?: PrintOrderItem[];
}

export interface PrintOrderItem {
    id: string;
    orderId: string;
    productType: PrintProductType;
    displayName: string;
    formatCode: PrintFormat;
    pdfUrl: string;
    pagesCount: number;
    sheetsCount: number;
    priceCents: number;
}

export const PRINT_PRICING: Record<PrintFormat, { basePriceCents: number, description: string }> = {
    [PrintFormat.HALF_LOOSE]: { basePriceCents: 1900, description: 'Kneeboard (No Binding)' },
    [PrintFormat.HALF_RING]: { basePriceCents: 2400, description: 'Kneeboard, Ring Bound' },
    [PrintFormat.HALF_SPIRAL]: { basePriceCents: 2900, description: 'Kneeboard, Spiral Bound' },
    [PrintFormat.FULL_STD]: { basePriceCents: 2500, description: 'Letter (No Binding)' }
}

export const PRINT_OVERAGE_CENTS = 200;
export const PRINT_STANDARD_PRICE_CENTS = 999;
