-- SlowPour authenticates in its Next.js server and connects directly to Postgres.
-- No table in this schema should be accessible through Supabase's Data API.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_snapshots ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.users, public.sessions, public.coffees, public.bags,
  public.recipes, public.brews, public.user_settings, public.journal_snapshots
FROM PUBLIC, anon, authenticated;
