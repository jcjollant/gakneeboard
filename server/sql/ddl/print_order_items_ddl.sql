CREATE TABLE IF NOT EXISTS print_order_items(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid,
    product_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    format_code TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    pages_count INTEGER NOT NULL DEFAULT 0,
    sheets_count INTEGER NOT NULL DEFAULT 0,
    price_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    CONSTRAINT print_order_items_order_id_fkey FOREIGN key(order_id) REFERENCES print_orders(id)
);