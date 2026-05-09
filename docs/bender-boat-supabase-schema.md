# Bender Boat Solution — Supabase Schema Design

**Client:** Standing Tide (Eric Bardot)
**Instance:** Standalone — single client, no multi-tenancy
**Vessels:** 3 x Bender Class

---

## Design Principles

- Every table traces back to a `vessel_id` or a `voyage_id` (which itself has a `vessel_id`)
- No soft multi-tenancy hacks needed — this is their instance, their data
- Supabase Auth handles users (officers logging watches, admins managing crew)
- Row Level Security (RLS) used for role separation (bridge officer vs. admin vs. read-only shoreside)
- All timestamps stored as `timestamptz` (UTC), displayed in local/vessel time zone in the UI

---

## Schema Overview

```
vessels
voyages                  → vessels
positions                → vessels
crew_members
crew_credentials         → crew_members
credential_types         (lookup)
position_credential_req  → positions, credential_types
assignments              → crew_members, vessels, voyages, positions
watch_schedules          → voyages
watch_assignments        → watch_schedules, crew_members
watch_entries            → watch_schedules, watch_assignments, crew_members
work_hour_records        → crew_members, voyages
engineering_rounds       → watch_entries, crew_members, voyages
ships_rounds             → voyages, crew_members
ships_round_items        → ships_rounds
wakeup_logs              → ships_rounds, crew_members
corrective_actions       → ships_rounds, ships_round_items
nav_log_entries          → watch_entries, voyages
drug_tests               → crew_members
travel_records           → crew_members, assignments
cost_events              → crew_members, voyages, travel_records, assignments
sea_time_records         → crew_members, voyages
users                    → crew_members (Supabase Auth)
```

---

## Tables — Detail

### `vessels`
The three Bender Class ships. Master reference for everything.

```sql
id                  uuid PK
name                text               -- e.g. "SANSU Bender I"
uscg_doc_number     text
call_sign           text
flag                text default 'USA'
vessel_type         text               -- e.g. "Offshore Supply Vessel"
gross_tons          numeric
length_ft           numeric
home_port           text
coi_expiry          date               -- Certificate of Inspection
drydock_due         date
timezone            text               -- default display timezone for this vessel
config              jsonb              -- vessel-specific feature flags / round templates
created_at          timestamptz
```

---

### `voyages`
The master operational record. Everything — crew, watches, logs — is a child of a voyage.

```sql
id                  uuid PK
vessel_id           uuid FK → vessels
name                text               -- e.g. "Gulf Run 24 / May 2026"
status              text               -- planned | active | completed | cancelled
departure_port      text
arrival_port        text
planned_departure   timestamptz
planned_arrival     timestamptz
actual_departure    timestamptz
actual_arrival      timestamptz
watch_pattern       text               -- "4_8" | "6_6" | "4_4_8" — drives watch schedule generation
required_complement jsonb              -- { "master": 1, "chief_mate": 1, "ab": 2, "chief_engineer": 1, ... }
notes               text
closed_at           timestamptz        -- set when voyage is formally closed; triggers sea time credit
closed_by           uuid FK → users
created_at          timestamptz
```

---

### `positions`
Roles that exist on each vessel. Drives credential requirements and watch assignments.

```sql
id                  uuid PK
vessel_id           uuid FK → vessels
title               text               -- "Master", "Chief Mate", "AB", "Chief Engineer", "QMED", etc.
department          text               -- "deck" | "engine" | "steward"
is_watch_standing   boolean            -- does this position stand watches?
is_safety_sensitive boolean            -- included in drug test random pool?
sort_order          int
```

---

### `crew_members`
All mariners in the system — assigned, in the relief pool, or inactive.

```sql
id                  uuid PK
first_name          text
last_name           text
preferred_name      text
email               text unique
phone               text
mailing_address     jsonb
emergency_contact   jsonb              -- { name, relationship, phone }
status              text               -- active | inactive | suspended
hire_date           date
notes               text
photo_url           text
created_at          timestamptz
```

---

### `credential_types`
Lookup table defining every type of credential the system tracks.

```sql
id                  uuid PK
name                text               -- "MMC", "STCW Basic Safety", "TWIC", "Medical Certificate", "Passport", etc.
issuing_authority   text               -- "USCG", "TSA", "NMC", etc.
has_expiry          boolean
renewal_lead_days   int                -- how many days before expiry to start alerting (default 90)
document_category   text               -- "license" | "certification" | "identity" | "medical" | "endorsement"
notes               text
```

---

### `crew_credentials`
Each credential held by each crew member.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
credential_type_id  uuid FK → credential_types
document_number     text
issued_date         date
expiry_date         date               -- null if has_expiry = false
issuing_body        text               -- specific office/location
document_url        text               -- Supabase Storage reference (scan/photo of document)
status              text               -- valid | expired | suspended | pending_renewal
notes               text
created_at          timestamptz
updated_at          timestamptz
```

---

### `position_credential_req`
The credential matrix — what each position requires. This is what the assignment checker runs against.

```sql
id                  uuid PK
position_id         uuid FK → positions
credential_type_id  uuid FK → credential_types
is_required         boolean            -- hard requirement vs. preferred
notes               text               -- e.g. "Required for Master per 46 CFR 15.812"
```

---

### `assignments`
Crew members assigned to a vessel and voyage in a specific position. The double-booking gate lives here.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
vessel_id           uuid FK → vessels
voyage_id           uuid FK → voyages    -- nullable for standing/permanent assignments
position_id         uuid FK → positions
assignment_type     text               -- "primary" | "relief"
relief_for          uuid FK → assignments  -- if relief, points to the primary assignment
status              text               -- pending | confirmed | active | completed | cancelled
rotation_start      timestamptz
rotation_end        timestamptz
actual_departure    timestamptz        -- when they actually left the vessel
handoff_complete    boolean default false
notes               text
created_by          uuid FK → users
created_at          timestamptz

-- Constraint: no overlapping assignments for same crew_member_id (enforced at DB + API level)
```

---

### `watch_schedules`
The watch rotation plan for a voyage. Generated from the voyage's `watch_pattern`.

```sql
id                  uuid PK
voyage_id           uuid FK → voyages
pattern             text               -- "4_8" | "6_6" | "4_4_8"
effective_from      timestamptz
effective_to        timestamptz        -- null if still active
generated_at        timestamptz
generated_by        uuid FK → users
notes               text
```

---

### `watch_assignments`
Which crew member stands which watch slot within the schedule.

```sql
id                  uuid PK
watch_schedule_id   uuid FK → watch_schedules
crew_member_id      uuid FK → crew_members
watch_slot          text               -- "0000-0400", "0400-0800", etc.
effective_from      date
effective_to        date               -- null = until rotation ends
notes               text
```

---

### `watch_entries`
The atomic operational record. One row per watch stood.

```sql
id                  uuid PK
watch_schedule_id   uuid FK → watch_schedules
watch_assignment_id uuid FK → watch_assignments
officer_id          uuid FK → crew_members   -- the OOW standing this watch
vessel_id           uuid FK → vessels
voyage_id           uuid FK → voyages
watch_start         timestamptz
watch_end           timestamptz
position_lat        numeric            -- at watch start
position_lon        numeric
position_source     text               -- "GPS" | "visual fix" | "DR"
weather_conditions  jsonb              -- { wind_dir, wind_speed, sea_state, visibility, barometer }
course              numeric            -- degrees true
speed               numeric            -- knots
engine_status       text               -- "UW normal" | "standby" | "anchored" | "moored"
traffic_notes       text
outstanding_issues  text               -- passed to oncoming watch
signed_off_at       timestamptz        -- when offgoing officer signed the watch
signed_off_by       uuid FK → crew_members
status              text               -- open | signed_off
created_at          timestamptz
```

---

### `work_hour_records`
Every hour worked tracked per crew member. Fed by watch entries and engineering rounds.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
voyage_id           uuid FK → voyages
record_date         date
period_start        timestamptz
period_end          timestamptz
hours_worked        numeric
record_type         text               -- "watch" | "engineering_round" | "drill" | "other"
source_id           uuid               -- FK to watch_entries or engineering_rounds
notes               text
```

---

### `engineering_rounds`
Periodic machinery space inspection records. Child of a watch entry.

```sql
id                  uuid PK
voyage_id           uuid FK → voyages
watch_entry_id      uuid FK → watch_entries   -- which watch this round was conducted during
conducted_by        uuid FK → crew_members
round_time          timestamptz
template_used       text               -- references vessel config template name

-- Key readings (extensible via readings jsonb for vessel-specific items)
main_engine_rpm     numeric
main_engine_oil_pressure  numeric
main_engine_coolant_temp  numeric
gearbox_oil_pressure      numeric
aux_engine_1_status       text
aux_engine_2_status       text
bilge_port_level    numeric
bilge_stbd_level    numeric
bilge_aft_level     numeric
fuel_main_pct       numeric
fuel_day_tank_pct   numeric
fresh_water_pct     numeric
lube_oil_level      text               -- "normal" | "low" | "critical"
readings            jsonb              -- catch-all for vessel-specific gauges
abnormalities       text
photos              jsonb              -- array of Supabase Storage URLs
status              text               -- normal | abnormality_noted | alert
created_at          timestamptz
```

---

### `ships_rounds`
Formal combined safety and engineering walkthrough. Distinct from routine engineering rounds.

```sql
id                  uuid PK
voyage_id           uuid FK → voyages
conducted_by        uuid FK → crew_members
round_start         timestamptz
round_end           timestamptz
round_type          text               -- "daily" | "weekly" | "pre_departure" | "post_arrival"
overall_status      text               -- satisfactory | deficiencies_noted | critical_deficiency
notes               text
created_at          timestamptz
```

---

### `ships_round_items`
Each checklist item within a ship's round.

```sql
id                  uuid PK
ships_round_id      uuid FK → ships_rounds
section             text               -- "bridge_navigation" | "deck_exterior" | "below_decks" | "machinery_space"
item_key            text               -- e.g. "nav_lights", "epirb_battery", "bilge_condition"
item_label          text               -- human-readable description
result              text               -- "pass" | "fail" | "na" | "requires_attention"
notes               text
photo_url           text               -- Supabase Storage reference
sort_order          int
```

---

### `wakeup_logs`
Record of watch wakeups conducted during ship's rounds.

```sql
id                  uuid PK
ships_round_id      uuid FK → ships_rounds
crew_member_id      uuid FK → crew_members
scheduled_wakeup    timestamptz        -- when they needed to be called
called_at           timestamptz        -- when officer made the call
acknowledged        boolean
acknowledged_at     timestamptz
second_call_required boolean default false
second_call_at      timestamptz
notes               text               -- e.g. "No response to first call, physical wakeup required"
```

---

### `corrective_actions`
Items flagged in ship's rounds requiring follow-up.

```sql
id                  uuid PK
ships_round_id      uuid FK → ships_rounds
ships_round_item_id uuid FK → ships_round_items
description         text
assigned_to         uuid FK → crew_members
due_date            date
priority            text               -- "low" | "medium" | "high" | "critical"
status              text               -- "open" | "in_progress" | "resolved" | "deferred"
resolution_notes    text
resolved_at         timestamptz
resolved_by         uuid FK → crew_members
created_at          timestamptz
```

---

### `nav_log_entries`
Navigation events recorded during a watch.

```sql
id                  uuid PK
voyage_id           uuid FK → voyages
watch_entry_id      uuid FK → watch_entries
recorded_by         uuid FK → crew_members
entry_time          timestamptz
entry_type          text               -- "course_change" | "position_fix" | "weather_obs" | "vts_report"
                                       -- | "anchoring" | "mooring" | "pilot_boarding" | "speed_change"
                                       -- | "hazard" | "other"
position_lat        numeric
position_lon        numeric
course              numeric
speed               numeric
details             jsonb              -- flexible per entry_type
notes               text
created_at          timestamptz
```

---

### `drug_tests`
Full drug and alcohol testing history per crew member.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
test_type           text               -- "pre_employment" | "random" | "post_incident"
                                       -- | "reasonable_cause" | "follow_up"
test_date           date
collection_site     text
lab_name            text
result              text               -- "negative" | "positive" | "cancelled" | "refused" | "pending"
substances_tested   jsonb              -- array of substance names (standard DOT 5-panel + alcohol)
result_date         date
mro_name            text               -- Medical Review Officer
chain_of_custody_number text
document_url        text               -- Supabase Storage (lab report)
notes               text
created_at          timestamptz
created_by          uuid FK → users
```

---

### `travel_records`
Crew travel coordination for each crew change.

```sql
id                  uuid PK
assignment_id       uuid FK → assignments
crew_member_id      uuid FK → crew_members
travel_direction    text               -- "to_vessel" | "from_vessel"
origin              text
destination         text
vessel_port         text               -- where the crew change actually happens
planned_arrival     timestamptz        -- when they're expected at the vessel
actual_arrival      timestamptz
flights             jsonb              -- [{ flight, departs, arrives, confirmation }]
hotel               jsonb              -- { name, checkin, checkout, confirmation }
ground_transport    jsonb
per_diem_days       int
booking_status      text               -- "not_booked" | "booked" | "confirmed" | "completed"
notes               text
created_at          timestamptz
```

---

### `cost_events`
Every financial event related to crew travel — bookings, changes, cancellations, and refunds. This is the backbone of the **Change Portal**, giving shore-side bookkeepers (e.g., Kelly at Standing Tide) full visibility into expense changes without chasing emails or reconciling credit card statements.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
voyage_id           uuid FK → voyages        -- nullable (pre-voyage bookings)
assignment_id       uuid FK → assignments     -- nullable
travel_record_id    uuid FK → travel_records  -- nullable (if linked to a specific travel record)
event_type          text               -- 'booking' | 'change' | 'cancellation' | 'refund'
event_date          timestamptz
vendor              text               -- airline, hotel chain, car service, etc.
description         text               -- human-readable summary: "SFO→ORF, UA 1847, Jun 12"
reference_number    text               -- PNR, confirmation number, refund reference
original_amount     numeric            -- amount of the original booking (for changes/refunds)
amount              numeric            -- cost of this event (positive = expense, negative = credit/refund)
currency            text default 'USD'
cost_delta          numeric            -- net change from this event (0 for initial bookings)
refund_status       text               -- null | 'pending' | 'processing' | 'credited' | 'denied'
refund_expected_date date              -- when the refund is expected to post
refund_credited_date date              -- when the refund actually posted
reason              text               -- why the change happened: "Voyage delay", "Medical", "Airline schedule change"
parent_event_id     uuid FK → cost_events  -- links a refund/change back to the original booking
approved_by         text               -- who authorized the change
approved_at         timestamptz
notes               text
created_at          timestamptz
created_by          uuid FK → users
```

**Key design notes:**
- Every event traces to a crew member, so Kelly can filter by person
- `parent_event_id` chains events together: Booking → Change → Cancellation → Refund
- `cost_delta` enables instant net-spend calculations without re-summing the chain
- `refund_status` with expected/actual dates gives Kelly a refund tracking dashboard
- `voyage_id` link enables per-voyage P&L views
- The `reason` field is critical for bookkeeping — it answers "why did this cost change?"

---

### `sea_time_records`
Accumulated sea time per crew member per voyage. Written at voyage close.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
voyage_id           uuid FK → voyages
vessel_id           uuid FK → vessels
position_id         uuid FK → positions
vessel_name         text               -- denormalized for letter generation
vessel_type         text               -- denormalized
gross_tons          numeric            -- denormalized
route               text               -- departure → arrival port
days_underway       numeric
departure_date      date
arrival_date        date
capacity            text               -- "Master" | "Chief Mate" | etc. (as it should appear on sea service letter)
letter_generated_at timestamptz
letter_url          text               -- Supabase Storage (generated PDF)
created_at          timestamptz
```

---

### `users`
Supabase Auth users linked to crew members where applicable.

```sql
id                  uuid PK            -- matches Supabase Auth UID
crew_member_id      uuid FK → crew_members  -- nullable (some users are shore-side admin only)
role                text               -- "admin" | "vessel_admin" | "officer" | "engineer" | "readonly"
vessels_access      uuid[]             -- which vessels this user can see (empty = all)
last_login          timestamptz
```

---

## Key Constraints & Business Rules (Enforced at DB Level)

```sql
-- 1. No overlapping assignments for the same crew member
-- Enforced via exclusion constraint on assignments(crew_member_id, rotation_start, rotation_end)

-- 2. Watch entries must belong to a voyage on the same vessel as the watch schedule
-- Enforced via trigger or check constraint

-- 3. Sea time records are immutable once generated
-- Enforced via RLS policy (no UPDATE allowed after letter_generated_at is set)

-- 4. Voyage cannot be closed if any watch entry is still open (status = 'open')
-- Enforced via trigger on voyages UPDATE where status = 'completed'
```

---

## Supabase Storage Buckets

```
credentials/        -- scanned credential documents (private, RLS-controlled)
round-photos/       -- engineering round gauge photos, ship's round photos (private)
drug-tests/         -- lab reports (private, admin-only access)
sea-time-letters/   -- generated PDF sea service letters (private)
crew-photos/        -- profile photos (private)
```

---

## RLS Role Summary

| Role | Can See | Can Write |
|---|---|---|
| `admin` | Everything | Everything |
| `vessel_admin` | Their vessel(s) only | Their vessel(s) only |
| `officer` | Their voyage's log entries | Watch entries, nav log, ship's rounds for their watch |
| `engineer` | Their voyage's engineering data | Engineering rounds for their watch |
| `finance` | Travel records, cost events, crew names, voyage names | Cost events, travel records (financial fields only) |
| `readonly` | All records | Nothing |

---

## Notes on Standalone Deployment

- **Developer & Operator:** Ops Normal AI LLC — owns the development, deployment, and ongoing maintenance of the application layer
- **One Supabase project** for Standing Tide — their data, their keys, their storage bucket
- **No shared infrastructure** with any other client; fully isolated instance
- Standing Tide holds the Supabase project credentials; Ops Normal AI LLC builds and maintains the app on top of it
- Supabase project should be provisioned under Standing Tide's billing account — they own the data, Ops Normal AI LLC owns the code
- Backups via Supabase's built-in Point-in-Time Recovery (PITR) — enable on Pro plan from day one
- Environment: `production` only to start; add `staging` before any major feature releases
- Deployment: Vercel or similar, under Ops Normal AI LLC account, pointed at Standing Tide's domain
