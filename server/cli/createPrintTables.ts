
import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function createTables() {
    try {
        console.log('Creating print_orders table...');
        await sql`
            CREATE TABLE IF NOT EXISTS print_orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                status TEXT NOT NULL,
                amount_cents INTEGER NOT NULL DEFAULT 0,
                stripe_session_id TEXT,
                shipping_address JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        console.log('Creating print_order_items table...');
        await sql`
            CREATE TABLE IF NOT EXISTS print_order_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID REFERENCES print_orders(id),
                product_type TEXT NOT NULL,
                display_name TEXT NOT NULL,
                format_code TEXT NOT NULL, -- correlates to PrintFormat enum
                pdf_url TEXT NOT NULL,
                pages_count INTEGER NOT NULL DEFAULT 0,
                sheets_count INTEGER NOT NULL DEFAULT 0,
                price_cents INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

createTables();
