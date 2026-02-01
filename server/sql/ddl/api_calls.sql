-- 01/24/2026 Test + Prod
CREATE TYPE api_source AS ENUM ('nms', 'adip', 'skyvector', 'metar');
CREATE TABLE api_calls (
    id SERIAL PRIMARY KEY,
    create_time TIMESTAMP DEFAULT NOW(),
    api api_source,
    code VARCHAR(255),
    data_length INTEGER,
    data TEXT
);