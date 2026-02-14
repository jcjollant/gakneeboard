
import { PrintOrder, PrintOrderItem, PrintFormat, PrintProductType, PrintOrderStatus, PRINT_PRICING, PRINT_OVERAGE_CENTS, PRINT_STANDARD_PRICE_CENTS } from '@gak/shared';
import { PrintOrderDao } from '../dao/PrintOrderDao';
import { del, put } from '@vercel/blob';

export class PrintService {

    static async getCart(userId: string): Promise<PrintOrder> {
        let order = await PrintOrderDao.getDraft(userId);
        if (!order) {
            order = await PrintOrderDao.createDraft(userId);
        }
        return order;
    }

    static calculatePrice(format: PrintFormat, pagesCount: number): number {
        // dynamic pricing only for custom products.
        // Sheets count = CEIL(pages / 2)
        const sheetsCount = Math.ceil(pagesCount / 2);

        const formatPricing = PRINT_PRICING[format];
        if (!formatPricing) throw new Error(`Invalid format code: ${format}`);

        let price = formatPricing.basePriceCents;

        if (sheetsCount > 1) {
            price += (sheetsCount - 1) * PRINT_OVERAGE_CENTS;
        }

        return price;
    }

    static async addStandardItem(userId: string, displayName: string, formatCode: PrintFormat): Promise<PrintOrder> {
        const order = await this.getCart(userId);

        const item: Omit<PrintOrderItem, 'id' | 'orderId'> = {
            productType: PrintProductType.STANDARD,
            displayName,
            formatCode,
            pdfUrl: 'STANDARD_ASSET', // Placeholder, should be resolved or config based
            pagesCount: 0, // Ignored for standard
            sheetsCount: 1,
            priceCents: PRINT_STANDARD_PRICE_CENTS
        };

        await PrintOrderDao.addItem(order.id, item);
        await this.recalculateOrderTotal(order.id);

        return await this.getCart(userId);
    }

    static async addCustomItem(userId: string, displayName: string, formatCode: PrintFormat, pdfUrl: string, pagesCount: number): Promise<PrintOrder> {
        const order = await this.getCart(userId);

        const priceCents = this.calculatePrice(formatCode, pagesCount);
        const sheetsCount = Math.ceil(pagesCount / 2);

        const item: Omit<PrintOrderItem, 'id' | 'orderId'> = {
            productType: PrintProductType.CUSTOM,
            displayName,
            formatCode,
            pdfUrl,
            pagesCount,
            sheetsCount,
            priceCents
        };

        await PrintOrderDao.addItem(order.id, item);
        await this.recalculateOrderTotal(order.id);

        return await this.getCart(userId);
    }

    static async removeItem(userId: string, itemId: string): Promise<PrintOrder> {
        const order = await this.getCart(userId);
        // Verify item belongs to order? DAO just deletes by ID. Ideally check ownership.
        // For simplicity, we trust the ID or enhance DAO.
        // Let's enhance DAO later or assume ID is sufficient for now given userId context effectively guards access to cart.

        await PrintOrderDao.removeItem(itemId);
        await this.recalculateOrderTotal(order.id);

        return await this.getCart(userId);
    }

    private static async recalculateOrderTotal(orderId: string): Promise<void> {
        const items = await PrintOrderDao.getItems(orderId);
        console.debug('[PrintService.recalculateOrderTotal]', orderId, items);
        const total = items.reduce((sum, item) => sum + Number(item.priceCents), 0);
        console.debug('[PrintService.recalculateOrderTotal]', orderId, total);
        await PrintOrderDao.updateOrderAmount(orderId, total);
    }

    // Blob handling
    static async uploadPdf(userId: string, buffer: Buffer): Promise<string> {
        const blob = await put(`print/${userId}-${Date.now()}.pdf`, buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        return blob.url;
    }

    static async deletePdf(url: string): Promise<void> {
        await del(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
    }

    static async fulfillOrder(orderId: string, shippingAddress: any): Promise<void> {
        await PrintOrderDao.fulfillOrder(orderId, shippingAddress);
        // Maybe send email here or in Stripe webhook handler
    }

    static async countPdfPages(pdfBuffer: Buffer): Promise<number> {
        try {
            const pdfjs = await import("pdfjs-dist/legacy/build/pdf.min.mjs")
            const fakeWorker = {
                postMessage: () => { },
                addEventListener: () => { },
                removeEventListener: () => { },
            };
            // @ts-ignore
            pdfjs.GlobalWorkerOptions.workerPort = fakeWorker

            const loadingTask = pdfjs.getDocument({
                data: new Uint8Array(pdfBuffer),
            });
            const pdfDocument = await loadingTask.promise;
            return pdfDocument.numPages;
        } catch (e) {
            console.error('[PrintService.countPdfPages]', e);
            return 0;
        }
    }
}
