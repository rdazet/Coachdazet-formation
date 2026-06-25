-- New users are auto-approved with tier=1 (5 videos access, no manual validation)
ALTER TABLE profiles ALTER COLUMN status SET DEFAULT 'approved';
ALTER TABLE profiles ALTER COLUMN tier SET DEFAULT 1;

-- Update trigger: new clients get status='approved' and tier=1 immediately
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    'approved',
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
