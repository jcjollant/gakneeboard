import { sql } from "@vercel/postgres";
import { PrintOrder, PrintOrderItem, PrintOrderStatus, PrintProductType, PrintFormat } from '@gak/shared';

export class PrintOrderDao {

    static async getDraft(userId: string): Promise<PrintOrder | undefined> {
        const result = await sql`
            SELECT * FROM print_orders 
            WHERE user_id = ${userId} AND status = ${PrintOrderStatus.DRAFT}
            LIMIT 1
        `;
        if (result.rows.length === 0) return undefined;

        const order = this.mapOrderRow(result.rows[0]);
        order.items = await this.getItems(order.id);
        return order;
    }

    static async createDraft(userId: string): Promise<PrintOrder> {
        const result = await sql`
            INSERT INTO print_orders (user_id, status, amount_cents)
            VALUES (${userId}, ${PrintOrderStatus.DRAFT}, 0)
            RETURNING *
        `;
        return this.mapOrderRow(result.rows[0]);
    }

    static async getItems(orderId: string): Promise<PrintOrderItem[]> {
        const result = await sql`
            SELECT * FROM print_order_items WHERE order_id = ${orderId}
        `;
        return result.rows.map(row => this.mapItemRow(row));
    }

    static async addItem(orderId: string, item: Omit<PrintOrderItem, 'id' | 'orderId'>): Promise<PrintOrderItem> {
        // console.debug('[PrintOrderDao.addItem]', orderId, item);
        const result = await sql`
            INSERT INTO print_order_items (
                order_id, product_type, display_name, format_code, pdf_url, 
                pages_count, sheets_count, price_cents
            )
            VALUES (
                ${orderId}, ${item.productType}, ${item.displayName}, ${item.formatCode}, ${item.pdfUrl}, 
                ${item.pagesCount}, ${item.sheetsCount}, ${item.priceCents}
            )
            RETURNING *
        `;
        return this.mapItemRow(result.rows[0]);
    }

    static async removeItem(itemId: string): Promise<void> {
        await sql`DELETE FROM print_order_items WHERE id = ${itemId}`;
    }

    static async updateOrderAmount(orderId: string, amountCents: number): Promise<void> {
        await sql`UPDATE print_orders SET amount_cents = ${amountCents}, updated_at = NOW() WHERE id = ${orderId}`;
    }

    static async updateStripeSession(orderId: string, sessionId: string): Promise<void> {
        await sql`UPDATE print_orders SET stripe_session_id = ${sessionId}, updated_at = NOW() WHERE id = ${orderId}`;
    }

    static async fulfillOrder(orderId: string, shippingAddress: any): Promise<void> {
        await sql`
            UPDATE print_orders 
            SET status = ${PrintOrderStatus.PAID}, 
                shipping_address = ${shippingAddress}, 
                updated_at = NOW() 
            WHERE id = ${orderId}
        `;
    }

    static async getById(orderId: string): Promise<PrintOrder | undefined> {
        const result = await sql`
            SELECT * FROM print_orders WHERE id = ${orderId}
        `;
        if (result.rows.length === 0) return undefined;

        const order = this.mapOrderRow(result.rows[0]);
        order.items = await this.getItems(order.id);
        return order;
    }

    static async listOpenOrders(): Promise<PrintOrder[]> {
        const result = await sql`
            SELECT * FROM print_orders 
            WHERE status IN (${PrintOrderStatus.PAID}, ${PrintOrderStatus.SHIPPED})
            ORDER BY created_at DESC
        `;
        const orders: PrintOrder[] = result.rows.map(row => this.mapOrderRow(row));

        for (const order of orders) {
            order.items = await this.getItems(order.id);
        }
        return orders;
    }

    static async updateStatus(orderId: string, status: PrintOrderStatus): Promise<void> {
        await sql`UPDATE print_orders SET status = ${status}, updated_at = NOW() WHERE id = ${orderId}`;
    }

    static async getAbandonedDrafts(daysOld: number): Promise<PrintOrder[]> {
        const result = await sql`
            SELECT * FROM print_orders 
            WHERE status = ${PrintOrderStatus.DRAFT} 
            AND created_at < NOW() - INTERVAL '${daysOld} days'
        `;
        const orders: PrintOrder[] = result.rows.map(row => this.mapOrderRow(row));

        for (const order of orders) {
            order.items = await this.getItems(order.id);
        }
        return orders;
    }

    private static mapOrderRow(row: any): PrintOrder {
        return {
            id: row.id,
            userId: row.user_id,
            status: row.status,
            amountCents: row.amount_cents,
            stripeSessionId: row.stripe_session_id,
            shippingAddress: row.shipping_address,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            items: []
        };
    }

    private static mapItemRow(row: any): PrintOrderItem {
        return {
            id: row.id,
            orderId: row.order_id,
            productType: row.product_type,
            displayName: row.display_name,
            formatCode: row.format_code,
            pdfUrl: row.pdf_url,
            pagesCount: row.pages_count,
            sheetsCount: row.sheets_count,
            priceCents: row.price_cents
        };
    }
}
