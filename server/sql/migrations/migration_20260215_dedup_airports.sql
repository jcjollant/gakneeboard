-- Active: 1768842526847@@ep-proud-field-a6tfe60l-pooler.us-west-2.aws.neon.tech@5432@neondb
-- Add loc_id column
ALTER TABLE Airports ADD COLUMN IF NOT EXISTS loc_id VARCHAR(10);
-- Rename code to icao_id
ALTER TABLE Airports RENAME COLUMN code TO icao_id;
