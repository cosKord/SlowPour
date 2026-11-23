-- Remove locally managed credentials and require a fresh Google sign-in.
ALTER TABLE public.users ADD COLUMN google_sub text UNIQUE;
DELETE FROM public.sessions;
ALTER TABLE public.users DROP COLUMN password_hash;
