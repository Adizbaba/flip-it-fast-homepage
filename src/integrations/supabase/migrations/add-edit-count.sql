
-- Add edit_count column to auction_items if it doesn't exist
ALTER TABLE auction_items 
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Update any existing rows to have edit_count=0 if it's null
UPDATE auction_items 
SET edit_count = 0 
WHERE edit_count IS NULL;
