CREATE TABLE IF NOT EXISTS print_orders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    stripe_session_id TEXT,
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);