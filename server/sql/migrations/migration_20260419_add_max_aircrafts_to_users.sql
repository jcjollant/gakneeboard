-- Active: 1768842526847@@ep-proud-field-a6tfe60l-pooler.us-west-2.aws.neon.tech@5432@neondb
-- Migration to add max_aircrafts to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_aircrafts INTEGER DEFAULT -1;

UPDATE users SET max_aircrafts = 1 WHERE account_type = 'simmer';
UPDATE users SET max_aircrafts = 2 WHERE account_type = 'student';
UPDATE users SET max_aircrafts = 2 WHERE account_type = 'lifetime';
UPDATE users SET max_aircrafts = 5 WHERE account_type = 'checkride';
UPDATE users SET max_aircrafts = 2 WHERE account_type = 'beta';
