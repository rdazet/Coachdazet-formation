-- Change tier/payment_level default to 0 (no access until admin assigns payment)
-- 0 = no access, 1 = up to 5 videos, 2 = up to 10 videos, 3 = full access
ALTER TABLE profiles ALTER COLUMN tier SET DEFAULT 0;
