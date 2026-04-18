
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tail_number VARCHAR(8) NOT NULL,
    make VARCHAR(32),
    model VARCHAR(32),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_aircrafts_user_tail ON aircrafts (user_id, tail_number);
CREATE UNIQUE INDEX idx_aircrafts_template_tail ON aircrafts (tail_number) WHERE user_id IS NULL;
