-- URL Shortener (Shopee Deep Link) schema for Supabase Postgres

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.short_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text,
  og_title text,
  og_description text,
  og_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  mode text NOT NULL DEFAULT 'single' CHECK (mode IN ('single', 'rotate')),
  primary_url text NOT NULL,
  android_url text,
  ios_url text,
  desktop_url text,
  utm_defaults jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_short_links_slug ON public.short_links(slug);

CREATE TABLE IF NOT EXISTS public.short_link_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_link_id uuid NOT NULL REFERENCES public.short_links(id) ON DELETE CASCADE,
  url text NOT NULL,
  weight integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_short_link_destinations_link_id ON public.short_link_destinations(short_link_id);

CREATE TABLE IF NOT EXISTS public.short_link_counters (
  short_link_id uuid PRIMARY KEY REFERENCES public.short_links(id) ON DELETE CASCADE,
  total_clicks bigint NOT NULL DEFAULT 0,
  android_clicks bigint NOT NULL DEFAULT 0,
  ios_clicks bigint NOT NULL DEFAULT 0,
  desktop_clicks bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.short_link_click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_link_id uuid NOT NULL REFERENCES public.short_links(id) ON DELETE CASCADE,
  slug text NOT NULL,
  device text NOT NULL CHECK (device IN ('android', 'ios', 'desktop')),
  referrer text,
  ua text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_short_link_click_events_link_id ON public.short_link_click_events(short_link_id);
CREATE INDEX IF NOT EXISTS idx_short_link_click_events_created_at ON public.short_link_click_events(created_at);

-- Updated-at trigger helper (re-using same function name pattern as your main schema)
CREATE OR REPLACE FUNCTION public.short_link_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_short_links_updated_at ON public.short_links;
CREATE TRIGGER trg_short_links_updated_at
BEFORE UPDATE ON public.short_links
FOR EACH ROW EXECUTE FUNCTION public.short_link_set_updated_at();

-- Atomic counters increment via RPC
CREATE OR REPLACE FUNCTION public.short_link_increment_counters(p_short_link_id uuid, p_device_column text)
RETURNS void AS $$
BEGIN
  UPDATE public.short_link_counters
  SET
    total_clicks = total_clicks + 1,
    android_clicks = android_clicks + CASE WHEN p_device_column = 'android_clicks' THEN 1 ELSE 0 END,
    ios_clicks = ios_clicks + CASE WHEN p_device_column = 'ios_clicks' THEN 1 ELSE 0 END,
    desktop_clicks = desktop_clicks + CASE WHEN p_device_column = 'desktop_clicks' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE short_link_id = p_short_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
