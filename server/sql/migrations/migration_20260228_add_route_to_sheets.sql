-- Migration to add route field to sheets table
ALTER TABLE sheets ADD COLUMN route JSONB;
