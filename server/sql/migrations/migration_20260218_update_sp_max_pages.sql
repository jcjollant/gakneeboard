-- Migration to boost Student Pilot (sp) max pages from 4 to 8
UPDATE users 
SET max_pages = 8 
WHERE account_type = 'sp' AND (max_pages IS NULL OR max_pages < 8);
