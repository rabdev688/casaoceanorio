# Casa Oceano Rio booking spec

This file is the spec. The booking code follows it. The site is a direct-booking system for one house. VRBO listing 294715 stays the listing. This site does not write reservations into VRBO through an API, does not charge a card, and does not let a guest cancel from the page.

Property: Casa Oceano Rio, 1811a Butler Ave, Tybee Island, Ga 31328.
Hosts: Willie (912) 398-4113, wlfields@bellsouth.net. Shelly (912) 398-6901, tybeeshelly@yahoo.com.
Dates use the America/New_York calendar day.

## Rules

### 1. VRBO bookings are read-only imports

A stay that starts on VRBO is not typed in by hand.

- The secret VRBO export URL is `VRBO_ICAL_URL`. The listing number is only a label. It is not a URL.
- A normal availability load reuses the last successful VRBO pull for 6 hours. Check availability, and saving the booking form, call a fresh pull and ignore that cache. `/admin` also has Sync now.
- Each feed event becomes one `vrbo_blocks` row. The primary key for identity is the event UID, so a second sync updates the row instead of duplicating it.
- Admin shows these rows labeled VRBO. There is no edit and no delete.
- The public calendar never shows a guest name from the feed. It only shows that the nights are taken.
- A row is removed only when that UID is absent from a later successful pull.
- A failed pull keeps the previous rows and stores the error. It does not clear the table.
- Hosts cancel or change that stay on VRBO, then sync. This site cannot cancel a VRBO reservation.

If `VRBO_ICAL_URL` is missing, admin shows "VRBO calendar not configured". Sync now does not delete anything. It returns that message.

If the URL is set and no pull has ever succeeded, admin shows "VRBO calendar has not synced yet", plus the last error when a pull has failed.

In both cases the website can still take a booking. Missing VRBO data does not mark every night unavailable.

`GET /api/availability` includes `syncStatus.state`:

- `not_configured`: no `VRBO_ICAL_URL`
- `never_synced`: URL is set, no successful pull yet
- `ok`: last pull succeeded and is the current stored feed
- `error`: the last pull failed and the previous feed is still stored

### 2. Who can cancel

The site does not charge a card, so it cannot refund. Money collected by phone, check, or any other channel stays with Willie and Shelly.

- A guest cannot cancel from the site. The confirmation email tells them to call or text the hosts.
- Only a host, in `/admin`, can cancel a website booking or remove a manual block.
- Cancel sets that website stay to `cancelled`, sets `cancelled_at`, frees the nights on this site immediately, and drops the stay from `GET /api/calendar.ics`. The export includes confirmed rows only.
- VRBO opens those nights the next time it imports this site's feed. That is VRBO's schedule, not this site's.
- The guest is emailed immediately. The message names the reference and the dates, says the host cancelled the stay, and gives both phone numbers for refund questions.
- The hosts are emailed too. That note says to check listing 294715 if VRBO still shows the dates blocked.
- A failed guest email does not undo the cancellation. Admin can resend it.
- Cancelling here does not move money and does not log into VRBO.

### 3. Overlaps the database cannot prevent

Postgres guarantees two confirmed website stays cannot overlap, and a confirmed website stay cannot overlap a confirmed manual block. It cannot see a VRBO booking that has not reached the feed yet.

That gap is a host task. Neither side is cancelled automatically.

- Website against website: the exclusion constraint rejects the second commit. The guest is told those nights are no longer open. Nothing is saved.
- Website against a VRBO block already stored: the booking transaction reads those blocks and rejects the request the same way.
- Website confirmed, then a later VRBO pull covers the same nights: both rows are kept. The website stay is flagged. The hosts get one email for that stay. They resolve it by phone and on VRBO.

A clash between this website and VRBO is uncommon. The book page says Willie and Shelly resolve it by phone.

### Atomic sync

A successful pull is one database transaction. A failed fetch or a feed that is not a calendar never enters it.

```
BEGIN
  lock this sync
  delete vrbo_blocks whose event UID is not in this feed
  insert or update the current events
  recompute conflict on every confirmed website stay
COMMIT
```

Recompute means the flag matches the rows just written: `conflict` is true when that stay overlaps any VRBO block, and false when it does not. After commit, send one host email for each website stay whose flag changed from false to true. Stays that were already flagged are not emailed again. Clearing a flag does not send an email.

Two website requests for the same nights are still decided by the exclusion constraint, inside the booking insert, separate from this sync.

## What a guest can do

The home page and `/book` both render the booking section.

- The calendar shows 18 months, starting with the current month in America/New_York. The old May through August 2026 list is not the source of blocked dates.
- Taken nights come from confirmed website stays, manual blocks, and VRBO blocks. Check-in is inclusive and check-out is exclusive, so the morning a guest leaves stays open for the next arrival.
- A click on a taken night does not start a stay. A checkout date may fall on the next guest's arrival day, because that night is not part of the range. A range that includes a taken night is rejected in the browser and again on the server.
- Past dates, and dates outside the 18 month window, cannot be selected.
- The form collects full name, email, phone, check-in, check-out, guests (1 to 16), and an optional message.
- If the nights are free, the stay is confirmed, the guest and the hosts are emailed, and the nights show as blocked in admin.
- If they are not free, the guest sees that those nights are no longer open. Nothing is saved.
- The home booking bar and the mobile sheet pass the chosen dates and guest count into the form. Empty dates replace the old June 2026 defaults. Guest count defaults to 2.
- If the database is not configured, the form does not pretend the stay was saved. It tells the guest to call or text the hosts.

## Emails

Sent with Nodemailer through the SMTP settings already in `.env`. A failed send never rolls back a saved stay or a cancellation.

- Host is `MAIL_HOST`, port is `MAIL_PORT`. Port 465 uses implicit TLS. Any other port, including 587, uses STARTTLS.
- Auth user is `MAIL_USER`, or `MAIL_FROM` when `MAIL_USER` is not set. The From address is `MAIL_FROM`, or the auth user when `MAIL_FROM` is not set. The password is `MAIL_PASSWORD`.
- Guest confirmation and guest cancellation go to the email on the booking.
- Host booking, conflict, and cancel notices go to `MAIL_TO`. Several addresses are separated by commas.

Guest confirmation:

- Subject: Your Casa Oceano Rio stay is confirmed (CO-...)
- Reference, check-in date, check-out date, guest count
- 1811a Butler Ave, Tybee Island, Ga 31328
- Willie (912) 398-4113 and Shelly (912) 398-6901
- Call or text to change or cancel
- No price and no clock time

Guest cancellation:

- Subject: Your booking CO-... has been cancelled
- Reference and dates
- The host cancelled the stay
- Both phone numbers for refund questions

Host booking alert, to `MAIL_TO`:

- Reference, dates, guest count
- Guest name, email, phone, and message
- "Block listing 294715 now if VRBO has not imported the calendar yet."
- Link to `/admin`

Host conflict alert, one per newly flagged stay:

- Which row is the website booking (reference, dates, guest name, email, phone)
- Which VRBO block or blocks overlap it (dates only)
- Contact the guest and check listing 294715
- Neither booking was cancelled automatically

Host cancel notice:

- Reference and dates
- The nights are open on this site
- Check listing 294715 if VRBO still shows them blocked

## Data

Applied by the owners in the Neon SQL editor. The app does not run this file against a database.

`stays` holds website bookings and manual blocks.

- `id` uuid
- `reference` unique text. Website references look like `CO-20261105-001`. The date is the America/New_York day the row was created. The number restarts each day. Manual blocks use `MB-` with the same counter.
- `source` is `website` or `manual`
- `status` is `confirmed` or `cancelled`
- `check_in` date, `check_out` date, checkout after check-in
- `guest_name`, `guest_email`, `guest_phone`, `guests`, `message` (manual blocks may leave guest fields empty and store a note in `message`)
- `conflict` boolean, default false
- `guest_email_status` and `host_email_status`: `pending`, `sent`, or `failed`
- `created_at`, `cancelled_at`
- GiST exclusion constraint on `daterange(check_in, check_out, '[)')` for rows where `status = 'confirmed'`

`vrbo_blocks` is a separate table with no exclusion constraint, so a conflicting VRBO event can be stored.

- `event_uid` unique text
- `check_in`, `check_out`, `summary`, `synced_at`

`sync_state` is one row: `last_success_at`, `last_error`, `last_error_at`.

`booking_counters` is one row per calendar day, incremented inside the booking insert so two requests cannot take the same reference.

## HTTP

All handlers speak the Web `Request` and `Response`. The Vite dev server mounts the same handlers. `vercel.json` does not send `/api` to `index.html`.

### GET /api/availability

Public. No guest names.

```json
{
  "today": "2026-10-27",
  "horizonEnd": "2028-04-01",
  "blocked": [
    { "checkIn": "2026-11-10", "checkOut": "2026-11-13", "source": "website" }
  ],
  "syncStatus": {
    "state": "ok",
    "lastSync": "2026-10-27T18:00:00.000Z",
    "lastError": null
  },
  "bookingEnabled": true
}
```

`horizonEnd` is the latest allowed checkout: the first day of the month 18 months after the current month. `source` is `website`, `manual`, or `vrbo`.

If `DATABASE_URL` is missing, `bookingEnabled` is false, `blocked` is empty, and `syncStatus.state` is `not_configured` with an error that the database is not configured.

### POST /api/bookings

Body: `checkIn`, `checkOut`, `guests`, `guestName`, `guestEmail`, `guestPhone`, `message`.

Order:

1. Reject a missing database with 503.
2. Reject bad fields with 400. Check-in is today or later. Check-out is after check-in and on or before `horizonEnd`. Guests are 1 through 16.
3. Pull the VRBO feed immediately. The booking form ignores the 6 hour cache.
4. In one statement, refuse the insert if a confirmed stay or a VRBO block overlaps, take the next daily reference, and insert `status = confirmed`.
5. The exclusion constraint is the backstop if two inserts race. The loser gets 409 and nothing is saved.
6. Email the guest and the hosts. Update the two email status columns.
7. Return 201 with `reference`, `checkIn`, `checkOut`, and `guests`.

409 body: `{ "error": "Those nights are no longer open." }`

### GET /api/calendar.ics?token=

- Token must match `ICS_EXPORT_TOKEN`. Otherwise 401.
- If the token is not configured, 503. The feed is never public.
- Body is a `text/calendar` document of confirmed website stays and manual blocks only.
- Summaries are "Reserved CO-..." or "Blocked MB-...". No guest email or phone.
- All-day dates. `DTEND` is the checkout date and is exclusive.
- VRBO imports this URL on its own schedule.

### Admin

`/admin` is not in the public nav. `POST /api/admin/login` checks `ADMIN_PASSWORD` and sets an httpOnly signed cookie (`SESSION_SECRET`, 7 days, SameSite=Lax). Logout clears it. If the password or session secret is missing, login returns 503.

`GET /api/admin/stays` returns website and manual stays (guest details, email status, conflict, cancellation), VRBO blocks, sync status, and the private export URL when the token and site URL exist.

`POST /api/admin/manual-block` with `checkIn`, `checkOut`, and optional `note`. It uses the same overlap rules. Delete removes a manual block only.

`POST /api/admin/cancel` with `id` cancels one confirmed website stay, then sends the guest cancellation and the host notice.

`POST /api/admin/resend` with `id` resends the guest confirmation or the guest cancellation, matching the stay status.

`POST /api/admin/sync` pulls immediately. Without a URL it changes nothing and returns the not-configured message.

VRBO rows have no update or delete route.

## iCal details

Inbound events use `UID`. A missing UID gets a stable fallback from the start, end, and summary so the night is not dropped.

`DTSTART` / `DTEND` with `VALUE=DATE` are calendar dates. `DTEND` is exclusive. Folded lines are unfolded. A feed that does not contain `BEGIN:VCALENDAR` is an error and does not replace stored blocks. A valid calendar with zero events does replace them, because that is a successful empty pull.

## Environment

Already set, and read as-is:

- `DATABASE_URL`: the Neon pooled connection string in `.env`. The app does not create a new database and does not run `db/schema.sql`.
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_TO`. `MAIL_FROM` is optional.

Still required before admin and VRBO sync work:

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `VRBO_ICAL_URL`
- `ICS_EXPORT_TOKEN`
- `PUBLIC_SITE_URL` (no trailing slash)

## Owners set this up once

1. Run `db/schema.sql` once in the Neon SQL editor for the database `DATABASE_URL` already points at.
2. In the VRBO owner calendar for listing 294715, copy the export URL into `VRBO_ICAL_URL`.
3. Paste this site's private iCal URL into VRBO's import calendar.

## Tests

`server/dates.ts` and `server/ical.ts` are pure. `node --experimental-strip-types --test` covers night overlap (touching ranges do not overlap, checkout morning is free) and iCal parse, including a folded line. The dev server and the production build are not part of this check.
