-- Apply once to the Postgres database used by SlowPour.
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);

CREATE TABLE coffees (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id text NOT NULL,
  name text NOT NULL,
  roaster text NOT NULL,
  origin text NOT NULL,
  process text NOT NULL,
  roast text NOT NULL,
  notes jsonb NOT NULL DEFAULT '[]',
  description text NOT NULL DEFAULT '',
  tasting_profile jsonb,
  packaging jsonb NOT NULL,
  PRIMARY KEY (user_id, id)
);

CREATE TABLE bags (
  user_id uuid NOT NULL,
  id text NOT NULL,
  coffee_id text NOT NULL,
  starting_weight_g numeric NOT NULL CHECK (starting_weight_g > 0),
  remaining_weight_g numeric NOT NULL CHECK (remaining_weight_g >= 0),
  status text NOT NULL CHECK (status IN ('unopened', 'in_rotation', 'finished')),
  roasted_at date NOT NULL,
  PRIMARY KEY (user_id, id),
  FOREIGN KEY (user_id, coffee_id) REFERENCES coffees(user_id, id) ON DELETE CASCADE
);

CREATE TABLE recipes (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id text NOT NULL,
  coffee_id text,
  name text NOT NULL,
  method text NOT NULL,
  dose_g numeric NOT NULL CHECK (dose_g > 0),
  water_ml numeric NOT NULL CHECK (water_ml > 0),
  temperature_c numeric NOT NULL,
  grind text NOT NULL,
  grind_clicks numeric NOT NULL,
  target_time_sec numeric NOT NULL,
  favourite boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, id),
  FOREIGN KEY (user_id, coffee_id) REFERENCES coffees(user_id, id) ON DELETE SET NULL (coffee_id)
);

CREATE TABLE brews (
  user_id uuid NOT NULL,
  id uuid NOT NULL,
  coffee_id text NOT NULL,
  recipe_id text,
  brewed_at timestamptz NOT NULL,
  method text NOT NULL,
  dose_g numeric NOT NULL CHECK (dose_g > 0),
  water_ml numeric NOT NULL CHECK (water_ml > 0),
  rating numeric NOT NULL,
  notes text NOT NULL DEFAULT '',
  temperature_c numeric NOT NULL,
  grind_clicks numeric NOT NULL,
  time_sec numeric NOT NULL,
  dial_in_cue text,
  checkpoints jsonb,
  PRIMARY KEY (user_id, id),
  FOREIGN KEY (user_id, coffee_id) REFERENCES coffees(user_id, id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, recipe_id) REFERENCES recipes(user_id, id) ON DELETE SET NULL (recipe_id)
);

CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  grinder_ids jsonb NOT NULL DEFAULT '[]',
  equipment_ids jsonb NOT NULL DEFAULT '[]',
  temp_unit text NOT NULL DEFAULT 'C' CHECK (temp_unit IN ('C', 'F')),
  default_dose numeric NOT NULL DEFAULT 15,
  selected_coffee_id text,
  grind_overrides jsonb NOT NULL DEFAULT '{}',
  go_to_recipe_ids jsonb NOT NULL DEFAULT '{}'
);

-- Atomic journal snapshot used by the current client while the domain tables
-- above provide the target model for endpoint-level writes.
CREATE TABLE journal_snapshots (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  document jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
