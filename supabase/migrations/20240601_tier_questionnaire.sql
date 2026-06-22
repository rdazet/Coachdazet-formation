-- Add tier to profiles (1 = modules 1-2, 2 = modules 3-4, 3 = module 5)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;

-- Questionnaire submissions table
CREATE TABLE IF NOT EXISTS questionnaire_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL,
  form_type TEXT, -- 'locataire', 'proprietaire', etc.
  form_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id)
);

-- RLS
ALTER TABLE questionnaire_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own submissions"
  ON questionnaire_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own submissions"
  ON questionnaire_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all submissions"
  ON questionnaire_submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update submissions"
  ON questionnaire_submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
