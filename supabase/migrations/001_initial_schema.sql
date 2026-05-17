-- ============================================================
-- Coachdazet Formation — Initial Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── APPROVAL TOKENS ────────────────────────────────────────
-- One-click approval/rejection tokens sent to admin by email
CREATE TABLE public.approval_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  action     TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MODULES ────────────────────────────────────────────────
CREATE TABLE public.modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── VIDEOS ─────────────────────────────────────────────────
CREATE TABLE public.videos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id   UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  bunny_url   TEXT NOT NULL,           -- Bunny Stream embed URL
  summary     TEXT,                    -- Rich text summary (HTML allowed)
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RESOURCES ──────────────────────────────────────────────
-- Downloadable files attached to videos (stored in Supabase Storage)
CREATE TABLE public.resources (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id   UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  file_path  TEXT NOT NULL,            -- Supabase Storage path
  file_type  TEXT NOT NULL CHECK (file_type IN ('pdf', 'pptx', 'xlsx')),
  file_size  BIGINT,                   -- in bytes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROGRESS ───────────────────────────────────────────────
-- Tracks which videos each user has completed
CREATE TABLE public.progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id     UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_approval_tokens_token ON public.approval_tokens(token);
CREATE INDEX idx_approval_tokens_user ON public.approval_tokens(user_id);
CREATE INDEX idx_videos_module ON public.videos(module_id);
CREATE INDEX idx_resources_video ON public.resources(video_id);
CREATE INDEX idx_progress_user ON public.progress(user_id);
CREATE INDEX idx_progress_video ON public.progress(video_id);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'admin' THEN 'approved'
      ELSE 'pending'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own; admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Modules: approved users and admins can read; admins can write
CREATE POLICY "Approved users can view modules"
  ON public.modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Videos: approved users and admins can read; admins can write
CREATE POLICY "Approved users can view videos"
  ON public.videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage videos"
  ON public.videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Resources: same as videos
CREATE POLICY "Approved users can view resources"
  ON public.resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage resources"
  ON public.resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Progress: users manage their own; admins read all
CREATE POLICY "Users can manage own progress"
  ON public.progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Approval tokens: service role only (managed via API routes)
CREATE POLICY "Service role only"
  ON public.approval_tokens FOR ALL
  USING (FALSE);

-- ─── SEED DATA — 5 MODULES ──────────────────────────────────
INSERT INTO public.modules (title, description, sort_order) VALUES
  ('Stratégie', 'Les fondamentaux de la stratégie financière personnelle', 1),
  ('Immobilier', 'Investir et optimiser votre patrimoine immobilier', 2),
  ('Bourse', 'Comprendre et investir en bourse avec confiance', 3),
  ('Budget', 'Maîtriser votre budget et vos dépenses', 4),
  ('Salaire', 'Optimiser vos revenus et votre carrière', 5);
