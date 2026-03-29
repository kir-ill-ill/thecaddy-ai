-- ============================================================
-- TheCaddy.AI  --  Full Database Migration
-- Generated from lib/db.ts, lib/auth-db.ts, lib/payments/db.ts
-- All statements use IF NOT EXISTS for idempotency.
-- Target: Neon PostgreSQL (compatible with vanilla PostgreSQL)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. USERS  (NextAuth + credential auth)
-- Source: lib/auth-db.ts  User interface
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT,
  email         TEXT NOT NULL UNIQUE,
  email_verified TIMESTAMPTZ,
  password_hash TEXT,
  image         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ============================================================
-- 2. ACCOUNTS  (NextAuth OAuth providers)
-- Source: lib/auth-db.ts  Account interface + createAccount()
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE (provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts (user_id);

-- ============================================================
-- 3. SESSIONS  (NextAuth sessions)
-- Source: lib/auth-db.ts  Session interface + createSession()
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_token TEXT NOT NULL UNIQUE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions (session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

-- ============================================================
-- 4. VERIFICATION_TOKENS  (magic-link / email verification)
-- Source: lib/auth-db.ts  createVerificationToken()
--   ON CONFLICT (identifier, token) => composite PK
-- ============================================================
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================================
-- 5. DESTINATIONS
-- Source: lib/db.ts  Destination interface
-- ============================================================
CREATE TABLE IF NOT EXISTS destinations (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT NOT NULL,
  region                TEXT NOT NULL,
  state                 TEXT NOT NULL,
  description           TEXT,
  vibe                  TEXT[] NOT NULL DEFAULT '{}',
  avg_green_fee_low     NUMERIC,
  avg_green_fee_high    NUMERIC,
  avg_lodging_per_night NUMERIC,
  best_months           INTEGER[] NOT NULL DEFAULT '{}',
  lat                   DOUBLE PRECISION,
  lng                   DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_destinations_state ON destinations (state);
CREATE INDEX IF NOT EXISTS idx_destinations_name  ON destinations (name);

-- ============================================================
-- 6. COURSES
-- Source: lib/db.ts  Course interface
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id                SERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  destination_id    INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
  city              TEXT NOT NULL,
  state             TEXT NOT NULL,
  lat               DOUBLE PRECISION NOT NULL,
  lng               DOUBLE PRECISION NOT NULL,
  holes             INTEGER NOT NULL DEFAULT 18,
  par               INTEGER NOT NULL DEFAULT 72,
  slope_rating      NUMERIC,
  course_rating     NUMERIC,
  quality_score     NUMERIC,
  green_fee_weekday NUMERIC,
  green_fee_weekend NUMERIC,
  cart_included     BOOLEAN NOT NULL DEFAULT false,
  walking_allowed   BOOLEAN NOT NULL DEFAULT true,
  resort_course     BOOLEAN NOT NULL DEFAULT false,
  public_course     BOOLEAN NOT NULL DEFAULT true,
  course_type       TEXT,
  designer          TEXT,
  year_built        INTEGER,
  description       TEXT,
  website           TEXT,
  phone             TEXT,
  amenities         TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_courses_destination_id ON courses (destination_id);
CREATE INDEX IF NOT EXISTS idx_courses_state          ON courses (state);
CREATE INDEX IF NOT EXISTS idx_courses_quality_score  ON courses (quality_score DESC NULLS LAST);

-- ============================================================
-- 7. LODGING
-- Source: lib/db.ts  Lodging interface
-- ============================================================
CREATE TABLE IF NOT EXISTS lodging (
  id                  SERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  destination_id      INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
  lodging_type        TEXT NOT NULL,
  city                TEXT NOT NULL,
  state               TEXT NOT NULL,
  lat                 DOUBLE PRECISION NOT NULL,
  lng                 DOUBLE PRECISION NOT NULL,
  price_per_night_low  NUMERIC,
  price_per_night_high NUMERIC,
  sleeps              INTEGER,
  bedrooms            INTEGER,
  has_golf_course     BOOLEAN NOT NULL DEFAULT false,
  amenities           TEXT[] NOT NULL DEFAULT '{}',
  description         TEXT
);

CREATE INDEX IF NOT EXISTS idx_lodging_destination_id ON lodging (destination_id);
CREATE INDEX IF NOT EXISTS idx_lodging_type           ON lodging (lodging_type);

-- ============================================================
-- 8. TRIPS
-- Source: lib/db.ts  Trip interface + createTrip()
--         lib/auth-db.ts  setTripOwner() adds owner_id
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trip_name         TEXT NOT NULL,
  origin_city       TEXT NOT NULL,
  origin_state      TEXT NOT NULL,
  players           INTEGER NOT NULL,
  start_date        TEXT NOT NULL,
  end_date          TEXT NOT NULL,
  nights            INTEGER NOT NULL,
  budget_per_person NUMERIC NOT NULL,
  budget_scope      TEXT NOT NULL DEFAULT 'unknown',
  vibe              TEXT NOT NULL DEFAULT 'competitive_fun',
  travel_mode       TEXT NOT NULL DEFAULT 'drive',
  lodging_pref      TEXT NOT NULL DEFAULT 'any',
  golf_density      TEXT NOT NULL DEFAULT '18_per_day',
  tee_time_pref     TEXT NOT NULL DEFAULT 'mid_morning',
  max_drive_hours   NUMERIC NOT NULL DEFAULT 4,
  captain_email     TEXT,
  owner_id          TEXT REFERENCES users(id) ON DELETE SET NULL,
  share_code        TEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_share_code ON trips (share_code);
CREATE INDEX IF NOT EXISTS idx_trips_owner_id   ON trips (owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_status     ON trips (status);

-- ============================================================
-- 9. TRIP_OPTIONS
-- Source: lib/db.ts  TripOption interface + saveTripOption()
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_options (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trip_id             TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  option_code         TEXT NOT NULL,
  title               TEXT NOT NULL,
  tagline             TEXT NOT NULL DEFAULT '',
  destination_id      INTEGER NOT NULL,
  destination_name    TEXT NOT NULL,
  cost_per_person     NUMERIC NOT NULL DEFAULT 0,
  cost_lodging        NUMERIC NOT NULL DEFAULT 0,
  cost_golf           NUMERIC NOT NULL DEFAULT 0,
  cost_food           NUMERIC NOT NULL DEFAULT 0,
  cost_transport      NUMERIC NOT NULL DEFAULT 0,
  score_total         NUMERIC NOT NULL DEFAULT 0,
  score_budget_fit    NUMERIC NOT NULL DEFAULT 0,
  score_travel_fit    NUMERIC NOT NULL DEFAULT 0,
  score_logistics     NUMERIC NOT NULL DEFAULT 0,
  score_vibe_match    NUMERIC NOT NULL DEFAULT 0,
  score_course_quality NUMERIC NOT NULL DEFAULT 0,
  why_it_fits         TEXT[] NOT NULL DEFAULT '{}',
  rank                INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_trip_options_trip_id ON trip_options (trip_id);

-- ============================================================
-- 10. TRIP_MEMBERS  (links users to trips)
-- Source: lib/auth-db.ts  addTripMember()
--   ON CONFLICT (trip_id, user_id) => composite unique
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_members (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trip_id   TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON trip_members (trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON trip_members (user_id);

-- ============================================================
-- 11. GROUP_RESPONSES
-- Source: lib/db.ts  GroupResponse interface + saveGroupResponse()
-- ============================================================
CREATE TABLE IF NOT EXISTS group_responses (
  id                  SERIAL PRIMARY KEY,
  trip_id             TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  email               TEXT,
  can_make_dates      TEXT[] NOT NULL DEFAULT '{}',
  budget_ok           BOOLEAN,
  max_budget          NUMERIC,
  lodging_pref        TEXT,
  preferred_option_id TEXT,
  notes               TEXT,
  responded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_responses_trip_id ON group_responses (trip_id);

-- ============================================================
-- 12. TRIP_FUNDS  (payment collection configuration)
-- Source: lib/payments/types.ts  TripFund interface
--         lib/payments/db.ts  createFund()
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_funds (
  id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trip_id                  TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL DEFAULT 'Trip Fund',
  target_amount_per_person NUMERIC,
  target_total             NUMERIC,
  fund_type                TEXT NOT NULL,          -- 'dues' | 'shared' | 'both'
  description              TEXT,
  due_date                 TEXT,
  captain_email            TEXT NOT NULL,
  captain_access_code      TEXT NOT NULL,
  stripe_product_id        TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_funds_trip_id             ON trip_funds (trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_funds_captain_access_code ON trip_funds (captain_access_code);

-- ============================================================
-- 13. PAYMENTS  (individual payment records)
-- Source: lib/payments/types.ts  Payment interface
--         lib/payments/db.ts  createPayment()
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fund_id                     TEXT NOT NULL REFERENCES trip_funds(id) ON DELETE CASCADE,
  trip_id                     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  payer_email                 TEXT NOT NULL,
  payer_name                  TEXT NOT NULL,
  amount                      NUMERIC NOT NULL,           -- in cents
  payment_type                TEXT NOT NULL,               -- 'dues' | 'contribution'
  stripe_payment_intent_id    TEXT,
  stripe_checkout_session_id  TEXT,
  status                      TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'failed' | 'refunded'
  paid_at                     TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_fund_id                    ON payments (fund_id);
CREATE INDEX IF NOT EXISTS idx_payments_trip_id                    ON payments (trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_checkout_session_id ON payments (stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status                     ON payments (status);

-- ============================================================
-- 14. PAYMENT_REQUESTS  (requests sent to group members)
-- Source: lib/payments/types.ts  PaymentRequest interface
--         lib/payments/db.ts  createPaymentRequest()
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_requests (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fund_id       TEXT NOT NULL REFERENCES trip_funds(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  name          TEXT,
  amount        NUMERIC NOT NULL,             -- in cents
  request_code  TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid' | 'cancelled'
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_fund_id      ON payment_requests (fund_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_request_code ON payment_requests (request_code);

-- ============================================================
-- Done.  All 14 tables created.
-- ============================================================
