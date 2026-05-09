# Bender Boat — Crew Management System Design

> **Developer:** Ops Normal AI LLC  
> **Client:** Standing Tide (Eric Bardot) — SANSU, 3 Bender Class vessels  

## The Problem

Commercial vessel crews are dynamic, constantly rotating resources with:
- Complex credential requirements per position (MMC, Med Cert, TWIC, STCW, etc.)
- Expiring documents that must never lapse while aboard
- Unpredictable schedules — crew travel to vessels anywhere, then home (or anywhere else)
- Relief/overlap planning when rotations don't align perfectly
- Double-booking risk when the same mariner is on multiple vessels
- No good tool currently manages all of this together with the vessel log

---

## Supabase Data Model

### `crew_members` table
```sql
id                    uuid PK
first_name            text
last_name             text
preferred_name        text
email                 text unique
phone                 text
home_city             text
home_state            text
home_country          text
emergency_contact     jsonb
photo_url             text
status                enum (active | inactive | on_leave | blacklisted)
notes                 text
created_at            timestamptz
updated_at            timestamptz
```

### `positions` table
```sql
id                    uuid PK
name                  text            -- "Master", "Chief Engineer", "AB", "Deckhand"
department            enum (deck | engineering | steward | dual)
license_required      bool
min_endorsements      text[]          -- required MMC endorsements
required_credentials  text[]          -- list of credential type IDs required for this position
notes                 text
```

### `credentials` table (document store)
```sql
id                    uuid PK
crew_member_id        uuid FK → crew_members
credential_type       enum (
                        mmc | medical_cert | twic | stcw_basic |
                        stcw_advanced_ff | stcw_pscrb | stcw_medical_pfa |
                        passport | us_visa | transportation_worker |
                        vessel_endorsement | radar | arpa | ecdis |
                        drug_test | background_check | other
                      )
credential_name       text            -- for 'other' type
issuing_authority     text
credential_number     text
issue_date            date
expiry_date           date            -- null if never expires
file_url              text            -- uploaded scan/photo
status                enum (valid | expiring_soon | expired | pending_renewal)
alert_days_before     int default 90  -- warn X days before expiry
notes                 text
created_at            timestamptz
updated_at            timestamptz
```

### `vessels` table
```sql
id                    uuid PK
name                  text
imo_number            text
call_sign             text
flag_state            text
vessel_type           text
home_port             text
owner_company         text
current_location      text            -- updated from voyage log
current_voyage_id     uuid FK → voyages (nullable)
engineering_template  jsonb           -- plant config for engineering rounds
config                jsonb           -- operations.config flags
status                enum (in_port | underway | laid_up | drydock)
```

### `vessel_positions` table (required crew per vessel)
```sql
id                    uuid PK
vessel_id             uuid FK → vessels
position_id           uuid FK → positions
quantity_required     int             -- how many of this role required
is_critical           bool            -- must be filled for vessel to sail
rotation_days_on      int             -- standard rotation length (e.g., 28)
rotation_days_off     int
notes                 text
```

### `assignments` table (the core scheduling table)
```sql
id                    uuid PK
crew_member_id        uuid FK → crew_members
vessel_id             uuid FK → vessels
position_id           uuid FK → positions
start_date            date
end_date              date            -- null if ongoing/open-ended
status                enum (
                        scheduled | active | completed |
                        cancelled | relief_pending
                      )
is_relief             bool            -- true if covering for another crew member
relieving_assignment_id uuid FK → assignments (self-ref, nullable)
overlap_days          int             -- days of overlap with incoming/outgoing crew
notes                 text
created_at            timestamptz
updated_at            timestamptz
```

**Overlap/double-booking prevention:**
- Before inserting an assignment, check: does this crew_member_id have any other assignment
  with overlapping dates and status NOT 'cancelled'?
- If yes, surface conflict to user with details

### `travel` table
```sql
id                    uuid PK
crew_member_id        uuid FK → crew_members
assignment_id         uuid FK → assignments
travel_type           enum (to_vessel | from_vessel | internal)
origin                text
destination           text
departure_datetime    timestamptz
arrival_datetime      timestamptz
carrier               text            -- airline, ferry, etc.
booking_ref           text
status                enum (planned | booked | confirmed | completed | cancelled)
notes                 text
attachments           text[]          -- boarding pass scans, etc.
created_at            timestamptz
```

### `credential_requirements` table (position → credential matrix)
```sql
id                    uuid PK
position_id           uuid FK → positions
credential_type       text            -- matches credentials.credential_type
is_mandatory          bool
notes                 text
```

---

## Core Features

### 1. Crew Roster & Profiles
- Full mariner profile: contact info, photo, home location, emergency contact
- All credentials visible at a glance with status indicators:
  - 🟢 Valid
  - 🟡 Expiring within alert window
  - 🔴 Expired
  - ⏳ Pending renewal
- Document uploads (MMC scan, passport photo, TWIC card, etc.)
- Quick filter: "show me all crew with expiring credentials in 90 days"

### 2. Credential Compliance Engine
- Each position has a required credential set (`credential_requirements`)
- When assigning a crew member to a position, system auto-checks:
  - Does this mariner have all required credentials for this position?
  - Are any credentials expired or expiring before their end date?
  - Surface warnings before confirming assignment
- **Compliance calendar** — visual view of all expirations across the crew roster
- **Automated alerts** — X days before expiry (configurable per credential type):
  - In-app notification
  - Email to crew member
  - Email to operations manager

### 3. Assignment & Rotation Management
- View all assignments per vessel in a Gantt-style timeline
- View all assignments per crew member across vessels
- **Conflict detection** — prevents double-booking same mariner
- **Rotation planning** — set standard rotation (e.g., 28/28) and auto-generate future assignments
- **Relief pool** — dashboard showing available mariners by position for a given date range
  - Filters by credential compliance
  - Filters by location (proximity to vessel for travel time)
  - Shows availability gaps

### 4. Overlap / Relief Planning
When a crew rotation happens:
- Incoming crew boards while outgoing crew is still aboard (overlap)
- System tracks overlap_days and who is relieving whom
- Overlap creates a natural handoff period — outgoing crew brief incoming crew
- Dashboard shows upcoming reliefs needing to be planned

### 5. Travel Coordination
For each assignment change, crew need to travel to/from the vessel:
- Vessel may be in any port worldwide
- Track flights, ferries, ground transport
- Track booking status (planned → booked → confirmed → completed)
- Alert if travel not booked within X days of assignment start
- Attach boarding passes, itineraries
- "Getting home" travel tracked too — crew may have non-standard routing

### 6. Watch Integration
When a crew member is assigned to a voyage via the wheelhouse log:
- Their assignment record links to the voyage
- Watch entries pull crew from active assignment roster — no manual entry
- STCW rest tracking pulls from watch records
- If a crew member's credential expires mid-voyage — alert is surfaced immediately

---

## Dashboards

### Operations Manager View
- Vessels at a glance: status, current crew count, voyage status
- Upcoming reliefs (next 30/60/90 days)
- Compliance alerts: expiring credentials across all vessels
- Open positions (slots not yet filled)
- Travel not yet booked
- Relief pool availability by position

### Vessel View
- Current crew manifest (with credential status indicators)
- Upcoming rotation dates
- Oncoming crew travel status
- Credential expiry alerts for current crew

### Mariner Profile View
- My current and upcoming assignments
- My credential status and expiry dates
- My travel records
- My rest hour log (STCW)

---

## Integration with Vessel Operations Log

| Crew System | Vessel Log |
|---|---|
| Active assignments | Auto-populate watch crew rosters |
| Crew IDs | Link to watch records, engineering rounds, ship's rounds |
| STCW rest data | Written back to crew compliance record |
| Position held | Determines permissions in log (Master vs. OOW vs. Engineer) |
| Voyage linked | Assignment start/end dates align with voyage dates |

---

## Build Estimate (Crew Management Layer)

| Module | Effort |
|---|---|
| Supabase schema + migrations | 2 days |
| Crew roster + profiles UI | 3 days |
| Credential management + uploads | 3 days |
| Compliance engine + alerts | 3 days |
| Assignment + scheduling UI | 4 days |
| Conflict detection | 2 days |
| Relief pool dashboard | 2 days |
| Travel coordination | 3 days |
| Ops manager dashboard | 3 days |
| Vessel log integration | 2 days |
| **Total** | **~27 days** |

Combined with vessel operations layer (~21 days): **~48 days total build**
