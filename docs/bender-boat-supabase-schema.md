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

-- Weekly Crewing Report (Sam's Monday Report) --
vessel_billets           → vessels, positions
billet_assignments       → vessel_billets, crew_members
crew_events              → crew_members, vessels, vessel_billets
recruitment_pipeline     → vessel_billets, crew_members
onboarding_checklists    → crew_members, vessels, vessel_billets
vessel_status_periods    → vessels
report_distribution      → vessels
report_history           → users
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

---

## Weekly Crewing Report Tables

*These tables power Sam's Monday crewing report — billet tracking, recruitment pipeline, onboarding, and automated report generation. Added to support push-button generation of the "Shipboard Crewing Update" that currently takes hours to compile manually from multiple spreadsheets.*

### `vessel_billets`
The vessel org chart — every required position that should be filled. This is the "should" side; `billet_assignments` is the "is" side. The gap between them = unfilled billets.

```sql
id                  uuid PK
vessel_id           uuid FK → vessels
position_id         uuid FK → positions        -- links to credential requirements via position_credential_req
title               text NOT NULL              -- display name: "Engine Mechanic", "Seasonal Steward 3"
department          text NOT NULL              -- "deck" | "engine" | "hotel" | "galley"
rotation_name       text                       -- named rotation slot: "Former Garcia", "Meland", "Rodriguez"
employment_type     text NOT NULL              -- "full_time_rotational" | "seasonal" | "temporary"
is_required         boolean DEFAULT true       -- required billet vs. optional/seasonal
effective_from      date                       -- when this billet was created/activated
effective_to        date                       -- NULL = ongoing; set when billet is eliminated
sort_order          int                        -- display order within department
notes               text
created_at          timestamptz
updated_at          timestamptz
```

**Design notes:**
- `position_id` links back to the existing `positions` table, which carries credential requirements. A billet is an *instance* of a position: the vessel might have one "AB" position definition but three AB billets (three ABs needed).
- `rotation_name` is Standing Tide's convention for naming rotation slots after the crew member who originally held them. Makes scheduling discussions human-readable: "We need to fill the Meland rotation on Sea Bird."
- `employment_type` drives report grouping — Sam's report separates full-time, seasonal, and temporary differently.

---

### `billet_assignments`
Who fills each billet and when. The daily snapshot of this table against `vessel_billets` produces the unfilled billet count.

```sql
id                  uuid PK
billet_id           uuid FK → vessel_billets
crew_member_id      uuid FK → crew_members
assigned_from       date NOT NULL              -- first day on the billet
assigned_to         date                       -- NULL = current; set on disembarkation
assignment_type     text NOT NULL              -- "permanent" | "fill_in" | "transfer" | "temporary"
related_event_id    uuid FK → crew_events      -- why this assignment started/ended (transfer, fill-in for medical, etc.)
notes               text
created_at          timestamptz
updated_at          timestamptz

-- Constraint: no overlapping assignments for the same billet_id
-- (only one person can fill a billet at a time)
```

**Unfilled billet calculation:**
```sql
-- Unfilled billets for a given week
SELECT vb.vessel_id, vb.title, vb.department, vb.rotation_name,
  SUM(CASE WHEN ba.id IS NULL THEN 1 ELSE 0 END) as unfilled_days
FROM vessel_billets vb
CROSS JOIN generate_series(week_start, week_end, '1 day') AS d(day)
LEFT JOIN billet_assignments ba
  ON ba.billet_id = vb.id
  AND ba.assigned_from <= d.day
  AND (ba.assigned_to IS NULL OR ba.assigned_to >= d.day)
WHERE vb.is_required = true
  AND vb.effective_from <= d.day
  AND (vb.effective_to IS NULL OR vb.effective_to >= d.day)
GROUP BY vb.vessel_id, vb.title, vb.department, vb.rotation_name
HAVING SUM(CASE WHEN ba.id IS NULL THEN 1 ELSE 0 END) > 0;
```

---

### `crew_events`
Lifecycle events for crew members — terminations, resignations, medical disembarkations, transfers, LOA. Powers the "Notes" column in Sam's unfilled billet report and provides audit trail for billet gaps.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
vessel_id           uuid FK → vessels          -- which vessel this event relates to
billet_id           uuid FK → vessel_billets   -- which billet was affected (nullable)
event_type          text NOT NULL              -- "termination" | "resignation" | "medical_disembark"
                                               -- | "loa" | "transfer" | "family_emergency"
                                               -- | "promotion" | "contract_end" | "clearance_issue"
event_date          date NOT NULL
end_date            date                       -- for LOA: expected return date
details             text                       -- "Terminated 3/3", "Medical disembarkation — rotator cuff"
impact_on_billet    text                       -- "vacated" | "temporary_gap" | "no_impact"
reported_by         uuid FK → users
created_at          timestamptz
```

---

### `recruitment_pipeline`
Tracks open positions from "unfilled" through "offer signed" to "onboarding." Each row is a recruitment effort for a specific billet.

```sql
id                  uuid PK
billet_id           uuid FK → vessel_billets   -- which billet we're recruiting for
vessel_id           uuid FK → vessels          -- denormalized for easy querying
status              text NOT NULL              -- "open" | "sourcing" | "candidate_identified"
                                               -- | "offer_pending" | "offer_sent" | "awaiting_signature"
                                               -- | "offer_signed" | "onboarding" | "filled" | "on_hold"
candidate_name      text                       -- name before they're in the system
candidate_id        uuid FK → crew_members     -- set once they become a crew_member record
department          text                       -- denormalized: "deck" | "engine" | "hotel" | "galley"
hire_type           text                       -- "new_hire" | "rehire" | "fill_in" | "promotion" | "transfer"
employment_type     text                       -- "full_time_rotational" | "seasonal" | "temporary"
date_needed         date                       -- when must this position be filled?
anticipated_embark  date                       -- when will the candidate board?
sourcing_notes      text                       -- recruiting channels, referrals, etc.
offer_amount        numeric                    -- salary/day rate (private, admin-only)
offer_sent_at       timestamptz
offer_signed_at     timestamptz
opened_at           timestamptz DEFAULT now()
closed_at           timestamptz                -- set when status = 'filled' or cancelled
closed_reason       text                       -- "filled" | "cancelled" | "merged" | "position_eliminated"
updated_by          uuid FK → users
updated_at          timestamptz
created_at          timestamptz
```

**Pipeline statuses mapped from Sam's report:**
| Sam's Report | System Status |
|---|---|
| *(blank — no candidate)* | `open` or `sourcing` |
| "Candidate identified" (yellow) | `candidate_identified` |
| "Need to Send Offer" | `offer_pending` |
| "Awaiting Signature" | `awaiting_signature` |
| "Offer Signed" | `offer_signed` |
| "Fill-In" | `hire_type = 'fill_in'` + `filled` |

---

### `onboarding_checklists`
Tracks new hires through the onboarding pipeline. Maps directly to the "Onboarding" table in Sam's weekly report.

```sql
id                  uuid PK
crew_member_id      uuid FK → crew_members
vessel_id           uuid FK → vessels
billet_id           uuid FK → vessel_billets   -- which billet they're onboarding into
position_title      text                       -- denormalized for report display
hire_type           text NOT NULL              -- "new_hire" | "rehire" | "fill_in" | "promotion"
employment_type     text NOT NULL              -- "full_time_rotational" | "seasonal" | "temporary"
department          text NOT NULL
travel_date         date                       -- when they travel to the vessel
embarkation_date    date                       -- when they board
rotation_name       text                       -- which rotation slot
manager_role        text                       -- "Cap." | "CM" | "CE" | "HM" | "HC" | "EO" | "BO"
status              text DEFAULT 'in_progress' -- "not_started" | "in_progress" | "complete" | "cancelled"
completion_pct      int DEFAULT 0              -- 0-100, derived from items
items               jsonb DEFAULT '[]'         -- checklist items:
                                               -- [{ "key": "w4_submitted", "label": "W-4 Submitted",
                                               --    "complete": true, "completed_at": "...", "required": true },
                                               --  { "key": "stcw_verified", "label": "STCW Certs Verified",
                                               --    "complete": false, "required": true }, ...]
pipeline_id         uuid FK → recruitment_pipeline  -- links back to the recruitment effort
notes               text
created_at          timestamptz
updated_at          timestamptz
```

---

### `vessel_status_periods`
Tracks vessel operational status over time. Needed because billets aren't "unfilled" the same way when a vessel is in wet dock or repositioning — Sam flags these in the report.

```sql
id                  uuid PK
vessel_id           uuid FK → vessels
status              text NOT NULL              -- "operational" | "repositioning" | "wet_dock"
                                               -- | "dry_dock" | "layup" | "charter"
start_date          date NOT NULL
end_date            date                       -- NULL = current status
location            text                       -- where the vessel is during this period
notes               text                       -- "Repositioning from Panama to Portland"
created_at          timestamptz
```

---

### `report_distribution`
Configurable distribution lists for automated reports. Sam's crewing update goes to 43 TO + 10 CC recipients.

```sql
id                  uuid PK
report_type         text NOT NULL              -- "weekly_crewing" | "billet_summary" | "onboarding_status"
vessel_id           uuid FK → vessels          -- NULL = all vessels
recipient_name      text NOT NULL
recipient_email     text NOT NULL
recipient_type      text NOT NULL              -- "to" | "cc" | "bcc"
department          text                       -- for filtering: "deck" | "engine" | "hotel" | "shore"
organization        text                       -- "Standing Tide" | "Lindblad" | etc.
is_active           boolean DEFAULT true
notes               text
created_at          timestamptz
```

---

### `report_history`
Audit log of generated reports. Every time the button is pressed, a record is created.

```sql
id                  uuid PK
report_type         text NOT NULL              -- "weekly_crewing"
report_date         date NOT NULL              -- the Monday this report covers
generated_by        uuid FK → users
generated_at        timestamptz
vessel_ids          uuid[]                     -- which vessels were included
recipient_count     int                        -- how many people received it
attachments         jsonb                      -- [{ "name": "Comings_Goings_5_4_26.xlsx", "url": "..." },
                                               --  { "name": "Unfilled_Billets_5_4_26.xlsx", "url": "..." },
                                               --  { "name": "Billet_Trend_5_4_26.png", "url": "..." }]
email_subject       text                       -- "Shipboard Crewing Update: 5/4/26"
email_body_html     text                       -- stored for audit/resend
status              text                       -- "generated" | "sent" | "failed"
error_details       text
notes               text
```

---

## Field Additions to Existing Tables

### `crew_members` — Employment Classification
```sql
ALTER TABLE crew_members ADD COLUMN employment_type text;
  -- "full_time_rotational" | "seasonal" | "temporary"
ALTER TABLE crew_members ADD COLUMN hire_type text;
  -- "new_hire" | "rehire" | "fill_in" | "promotion"
ALTER TABLE crew_members ADD COLUMN rotation_name text;
  -- Named rotation slot: "Former Garcia", "Meland"
ALTER TABLE crew_members ADD COLUMN department text;
  -- Primary department: "deck" | "engine" | "hotel" | "galley"
ALTER TABLE crew_members ADD COLUMN reports_to text;
  -- Supervisor role: "Cap." | "CM" | "CE" | "HM" | "HC"
```

### `travel_records` — Granular Booking Status
```sql
ALTER TABLE travel_records ADD COLUMN flight_booked boolean DEFAULT false;
ALTER TABLE travel_records ADD COLUMN hotel_booked boolean DEFAULT false;
ALTER TABLE travel_records ADD COLUMN visa_cleared boolean;
ALTER TABLE travel_records ADD COLUMN touchbase_sent boolean DEFAULT false;
ALTER TABLE travel_records ADD COLUMN touchbase_sent_at timestamptz;
ALTER TABLE travel_records ADD COLUMN crew_change_notes text;
  -- Free-text notes for the Comings & Goings report
```

### `positions` — Reporting Hierarchy
```sql
ALTER TABLE positions ADD COLUMN reports_to_position_id uuid FK → positions;
  -- Who does this role report to? Enables manager column in onboarding report
ALTER TABLE positions ADD COLUMN manager_abbreviation text;
  -- "Cap." | "CM" | "CE" | "HM" | "HC" — for report display
```

---

## Supabase Storage Buckets (Addition)

```
reports/            -- generated Excel files, trend charts, email snapshots (private, admin/finance access)
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

-- 5. No overlapping billet assignments for the same billet
-- Only one person can fill a billet at a time
-- Enforced via exclusion constraint on billet_assignments(billet_id, assigned_from, assigned_to)

-- 6. Recruitment pipeline: only one active recruitment per billet
-- WHERE status NOT IN ('filled', 'cancelled', 'on_hold')
-- Enforced via partial unique index

-- 7. Onboarding checklists: only one active checklist per crew member
-- WHERE status IN ('not_started', 'in_progress')
-- Enforced via partial unique index

-- 8. Vessel billets: effective_to must be >= effective_from when set
-- Enforced via CHECK constraint

-- 9. Billet assignment dates must fall within the billet's effective period
-- Enforced via trigger on INSERT/UPDATE
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
| `crewing` | Billets, assignments, recruitment, onboarding, crew events, travel status, reports | Billet assignments, recruitment pipeline, onboarding checklists, crew events, report generation |
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
