-- Update existing records to use the new format codes
UPDATE print_order_items SET format_code = 'KB_LOOSE' WHERE format_code = 'HALF_LOOSE';
UPDATE print_order_items SET format_code = 'KB_RING' WHERE format_code = 'HALF_RING';
UPDATE print_order_items SET format_code = 'KB_SPIRAL' WHERE format_code = 'HALF_SPIRAL';
UPDATE print_order_items SET format_code = 'LETTER_LOOSE' WHERE format_code = 'FULL_STD';

-- Note: If format_code is an ENUM type, you will also need to update the enum definition.
-- Example: ALTER TYPE print_format_code RENAME VALUE 'HALF_LOOSE' TO 'KB_LOOSE';
