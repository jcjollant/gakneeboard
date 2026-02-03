-- Migration to extend field limits and use JSONB for structured data

-- Metrics: VARCHAR(1024) -> JSONB
ALTER TABLE metrics ALTER COLUMN data TYPE JSONB USING data::JSONB;

-- Health Checks: VARCHAR(1024) -> JSONB
ALTER TABLE health_checks ALTER COLUMN data TYPE JSONB USING data::JSONB;

-- Feedback: VARCHAR(1024) -> TEXT
ALTER TABLE feedback ALTER COLUMN text TYPE TEXT;

-- Tickets: VARCHAR(1024) -> TEXT
ALTER TABLE tickets ALTER COLUMN message TYPE TEXT;
