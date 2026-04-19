-- Migration to add max_aircrafts to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_aircrafts INTEGER DEFAULT 0;
