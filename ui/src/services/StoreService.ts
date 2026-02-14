
import axios from 'axios';
import { UrlService } from './UrlService';
import { PrintOrder, PrintFormat, PrintProductType } from '@gak/shared';
import { CurrentUser } from '../assets/CurrentUser';

export class StoreService {
    static async getCart(user: CurrentUser): Promise<PrintOrder> {
        const url = UrlService.root + 'store/cart';
        const response = await axios.get(url, StoreService.getHeaders(user));
        return response.data;
    }

    static async addStandardItem(user: CurrentUser, displayName: string, formatCode: PrintFormat): Promise<PrintOrder> {
        const url = UrlService.root + 'store/cart/item';
        const payload = {
            productType: PrintProductType.STANDARD,
            displayName,
            formatCode
        };
        const response = await axios.post(url, payload, StoreService.getHeaders(user));
        return response.data;
    }

    static async addCustomItem(user: CurrentUser, displayName: string, formatCode: PrintFormat, pdfUrl: string, pagesCount: number): Promise<PrintOrder> {
        const url = UrlService.root + 'store/cart/item';
        const payload = {
            productType: PrintProductType.CUSTOM,
            displayName,
            formatCode,
            pdfUrl,
            pagesCount
        };
        const response = await axios.post(url, payload, StoreService.getHeaders(user));
        return response.data;
    }

    static async removeItem(user: CurrentUser, itemId: string): Promise<PrintOrder> {
        const url = UrlService.root + 'store/cart/item/' + itemId;
        const response = await axios.delete(url, StoreService.getHeaders(user));
        return response.data;
    }

    static async uploadPdf(user: CurrentUser, file: File): Promise<{ url: string, pagesCount: number }> {
        const url = UrlService.root + 'store/custom/upload';
        const formData = new FormData();
        formData.append('file', file);
        const headers = StoreService.getHeaders(user).headers;
        headers['Content-Type'] = 'multipart/form-data';

        const response = await axios.post(url, formData, { headers });
        return response.data;
    }

    static async checkout(user: CurrentUser, cart: PrintOrder): Promise<string> {
        const url = UrlService.root + 'store/checkout';
        const payload = { source: window.location.href };
        const response = await axios.post(url, payload, StoreService.getHeaders(user));
        return response.data.url;
    }

    private static getHeaders(user: CurrentUser): { headers: any } {
        return {
            headers: {
                'Content-Type': 'application/json',
                'user': user.sha256
            }
        };
    }
}
