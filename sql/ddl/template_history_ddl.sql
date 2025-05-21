-- Template history table to preserve previous template data
CREATE TABLE template_history(
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    data TEXT,
    name VARCHAR(255),
    version INTEGER,
    description VARCHAR(255),
    pages INTEGER,
    thumbnail VARCHAR(255),
    thumbhash CHAR(64),
    operation VARCHAR(10) NOT NULL, -- 'UPDATE' or 'DELETE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by template_id
CREATE INDEX idx_template_history_template_id ON template_history(template_id);

-- Index for faster lookups by user_id
CREATE INDEX idx_template_history_user_id ON template_history(user_id);
