-- Run once in the Neon SQL editor. The app does not apply this file.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE stays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  source text NOT NULL CHECK (source IN ('website', 'manual')),
  status text NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
  check_in date NOT NULL,
  check_out date NOT NULL,
  guest_name text,
  guest_email text,
  guest_phone text,
  guests integer CHECK (guests IS NULL OR (guests >= 1 AND guests <= 16)),
  message text,
  conflict boolean NOT NULL DEFAULT false,
  guest_email_status text NOT NULL DEFAULT 'pending' CHECK (guest_email_status IN ('pending', 'sent', 'failed')),
  host_email_status text NOT NULL DEFAULT 'pending' CHECK (host_email_status IN ('pending', 'sent', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  CHECK (check_out > check_in),
  CONSTRAINT stays_confirmed_no_overlap EXCLUDE USING gist (
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status = 'confirmed')
);

CREATE TABLE vrbo_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_uid text NOT NULL UNIQUE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  summary text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);

CREATE TABLE sync_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_success_at timestamptz,
  last_error text,
  last_error_at timestamptz
);

INSERT INTO sync_state (id) VALUES (1);

CREATE TABLE booking_counters (
  day date PRIMARY KEY,
  last_value integer NOT NULL
);
