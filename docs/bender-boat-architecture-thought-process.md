# Bender Boat Solution — Architecture Thought Process

> **Developer:** Ops Normal AI LLC  
> **Client:** Eric Bardot, Standing Tide (SANSU — 3 Bender Class vessels)  
> **Date:** May 2026  
> **Purpose:** Full system design rationale across all four pillars

---

## The Core Philosophy

Before diving into modules, it's worth stating the design philosophy that drives everything:

**The vessel is the center of gravity.** Every crew member, every credential, every watch, every log entry, every maintenance record orbits around a vessel and a time. The system's job is to make the *state of the vessel at any given moment* visible, compliant, and traceable — from the bridge to the boardroom.

The four pillars are not independent apps bolted together. They share a single data model and talk to each other continuously:
- The **ship schedule** defines when voyages happen and on which vessels
- **Crew assignments** populate those voyages with people
- **Credentials** gate whether those assignments are legal
- **Logs** capture what actually happened during those voyages

---

## Pillar 1: Ship Schedule Management

### The Problem
A vessel operating continuously over days or weeks doesn't fit a simple "open/close" model. The Bender Boats aren't ferry boats doing daily runs — they have voyages with defined departure ports, arrival ports, routes, and operational periods. Management needs to see across the whole fleet: which ships are underway, which are in port, which are on upcoming voyages, and what's the crew state for each.

### The Design Thinking

**Voyage as the Atomic Unit**

A "voyage" is the master record — not a day, not a watch, not a trip. Everything else is a child of a voyage:
- Departure port, departure time (planned and actual)
- Arrival port, arrival time (planned and actual)
- Vessel assigned
- Route or trade area
- Required complement (how many officers, engineers, deckhands, etc.)
- Status: `scheduled → active → completed → archived`

A voyage can span hours, days, or weeks. This is fundamentally different from the PIWT wheelhouse log which spans a single operating day.

**Fleet Calendar View**

The dashboard shows all three Bender Class vessels on a Gantt-style timeline. At a glance, management can see:
- Which vessel is underway and where
- Upcoming voyages and their crew fill status (green = fully crewed, yellow = partially filled, red = understaffed or compliance issue)
- Port calls and turnaround windows
- Overlap periods when two vessels are in port simultaneously (crew transfer windows)

**Port Calls and Layover Events**

Within a voyage, the system tracks port calls: arrival, duration, departure. These matter because:
1. Crew may join or depart during port calls
2. Resupply, bunkering, and maintenance events attach to port calls
3. Rest period compliance resets partially during extended port stays

**The Ship Schedule Talks to Crew Management**

When a voyage is created and its required complement is defined, it immediately creates "open slots" in the crew assignment system. Those slots drive the crew scheduling workflow — you can't fill a slot with someone whose credentials don't match the position, who's already assigned elsewhere, or who won't have adequate rest between their last rotation off.

---

## Pillar 2: Crew Schedule Management

This is the most complex pillar because it has the most interlocking constraints. Let's break it down by sub-component.

### 2A. Assignment & Rotation

**The Rotation Model**

Offshore vessels operate on rotation schedules — 28 days on / 28 days off, 14/14, 21/21, etc. The system needs to understand:
- Each **position** on each vessel has a primary mariner and a relief mariner
- When the primary's rotation ends, the relief is already scheduled to travel and relieve
- The primary departs only after the relief has arrived and completed a proper handoff

This isn't just scheduling — it's a *handoff workflow*. The system should track:
1. Relief mariner notified (X days before rotation end)
2. Travel arranged
3. Relief mariner arrived on vessel
4. Handoff completed (offgoing officer signs off the watch log; oncoming officer opens the next watch)
5. Primary departs

**The Relief Pool**

Eric specifically asked for "a visible/filterable pool of mariners not on the ships." This is the relief pool:
- All crew members not currently assigned to an active voyage
- Filterable by: position/license, available date, home port/travel cost, STCW status, drug test status
- Shows next available date for anyone currently on R&R
- Color-coded by how soon they become available (e.g., green = available now, yellow = available within 2 weeks, grey = unavailable/documentation issue)

### 2B. Double-Booking Prevention

**The Core Logic**

A mariner record has a `status` timeline — for any given date range, they are either:
- `assigned` (on a vessel, specific voyage)
- `in_transit` (traveling to or from a vessel)
- `available` (in the relief pool)
- `on_leave` (vacation, medical, personal)
- `unavailable` (drug testing window, suspended credential, etc.)

Before any assignment is saved, the system runs a **conflict check**:
```
Is this mariner's status anything other than 'available' 
for the proposed assignment date range?
  → If yes: BLOCK with explanation
  → If no: ALLOW and mark them assigned
```

This isn't just a nice check — it's a hard gate. The UI won't let you save an overlapping assignment, and the API enforces it too so nothing can sneak through a back door.

The system also catches *indirect* double-bookings: if a mariner is assigned to Vessel A with a rotation end of June 15, and someone tries to assign them to Vessel B starting June 14, the transit time assumption (say, 24 hours) means they literally can't be on Vessel B in time — the system flags this.

### 2C. Watch Rotation

**Why Watch Rotation is Different**

A watch rotation isn't a high-level schedule — it's an intra-voyage operational pattern. For vessels underway days or weeks at a time, someone must be standing watch continuously. The most common patterns:
- **4-on / 8-off** (traditional 3-watch system): 0000-0400, 0400-0800, 0800-1200, 1200-1600, 1600-2000, 2000-2400
- **6-on / 6-off** (2-watch): more fatiguing, used on shorter passages or smaller crews
- **Modified 5-watch** or other patterns per COI / company policy

The watch rotation system needs to:
1. Define the watch schedule for a voyage (which pattern, who is assigned to which watch)
2. Generate the watch log automatically (each watch period is a record to be filled in)
3. Track watch relief: the offgoing officer records conditions and signs off the watch log; the oncoming officer opens the next watch, acknowledging any outstanding issues (heading, weather, traffic, equipment status)
4. Feed into the fatigue/work hours calculation (see 2D)

**Watch Assignment**

Each watch slot has:
- Officer of the Watch (OOW) — licensed deck officer
- Engineering watch (if required)
- Additional watchstanders per COI

The system distributes watch assignments fairly across the crew rotation while respecting rest requirements. If someone stood the 2000-0000 watch, the system won't assign them the 0400-0800 watch (only 4 hours rest between). This connects directly to Coast Guard fatigue standards.

### 2D. Coast Guard Work Hours & Fatigue Standards

**The Regulatory Framework**

46 CFR Part 15.1111 (STCW) and 46 CFR Part 15.705 (domestic) set minimum rest requirements:
- **STCW (international/oceans):** Minimum 10 hours rest in any 24-hour period; minimum 77 hours rest in any 7-day period
- **Domestic:** Minimum 8 hours rest in any 24-hour period for most vessels
- Exceptions for emergency situations, but these must be logged

**How the System Enforces This**

Every watch assignment writes work-hour records. The system maintains a rolling calculation for each crew member:
- Hours worked in last 24 hours
- Hours worked in last 7 days
- Time since last rest period started

When someone is proposed for a watch assignment:
1. System calculates projected work hours with that assignment included
2. If it violates rest rules → **blocked with specific violation message** (e.g., "Assigning this watch would give Johnson only 7.5 hours rest in the last 24 hours — STCW minimum is 10 hours")
3. If it's approaching (within 1 hour of limit) → **yellow warning**

The system also generates a **work hours report** per mariner per voyage that can be exported for Coast Guard inspection. This is documentation the vessel is *required* to maintain, and doing it automatically instead of on paper is a significant operational improvement.

### 2E. Sea Time Calculation

**Why It Matters**

Sea time is currency for mariners. It's how they upgrade their Merchant Mariner Credential (MMC) — 360 days of sea service for a 100-ton upgrade, etc. Mariners need accurate sea time letters for USCG credential applications. Operators are often the bottleneck because generating these letters manually is a headache.

**How the System Handles It**

Because every voyage has a start/end time and every crew assignment is attached to a voyage, the system *automatically accumulates sea time* for every mariner:
- By vessel name and official number
- By voyage (departure/arrival port, dates)
- Distinguishing service in charge from service not in charge (different credit rates)
- Separating by route/geographic area (ocean, near-coastal, inland, rivers)

Outputs:
- **Sea time summary** per mariner: total days by category, ready to submit to NMC
- **Sea time letter** generator: pre-formatted USCG-acceptable letter, auto-filled from the database, needs only a signature
- **Verification view** for the mariner themselves: they can see their accumulated sea time without calling the office

### 2F. Drug & Alcohol Testing Tracking

**The Regulatory Context**

46 CFR Part 16 governs chemical testing for USCG-credentialed mariners. Required test types:
- **Pre-employment** — before first assignment or after a 60+ day break
- **Random** — at least 50% of safety-sensitive positions annually
- **Post-incident** — after serious marine incident
- **Reasonable cause** — based on observed behavior
- **Return-to-duty / follow-up** — after violation

**System Design**

Each mariner has a `drug_test_log` — every test recorded with: type, date, result, collection site, chain of custody reference.

The random testing pool is managed automatically:
- Safety-sensitive positions are flagged in the position definition
- A random selection tool lets the compliance officer pull a randomized list at whatever frequency they use
- When a mariner is selected, the system sets their status to `testing_required` which flows into the assignment workflow — they can't be assigned to a new voyage until the test is completed and result recorded

Pre-employment logic:
- When a mariner hasn't had an assignment in 60+ days, the system auto-flags them as requiring pre-employment testing before their next assignment
- This shows in the relief pool view so the scheduler knows before trying to assign them

Test result expiry:
- The credential management module (Pillar 3) tracks the drug test as a credential type with an expiration logic — this ensures compliance officers are reminded before a required test period lapses

### 2G. Travel Coordination

**The Problem**

Getting crew to and from vessels — especially when the vessel might be in different ports depending on the voyage schedule — is logistically messy. Flight bookings, hotel, ground transport, and the vessel's ETA at the crew change port all have to align. When they don't, you have either an idle mariner burning per diem in a hotel or a vessel short-crewed waiting for relief.

**System Design**

Each crew change event has a **travel record** attached:
- Mariner's origin (home address or wherever they're coming from)
- Vessel's planned crew change port and date
- Booking status: `pending → booked → confirmed → completed`
- Itinerary details: flights, hotel, ground transport
- Cost tracking (for payroll/expense reconciliation)
- Actual arrival vs. planned arrival (for on-time performance metrics)

**Integration Surface**

Initially, travel records are manually entered (scheduler books through their normal channels, then logs the itinerary in the system). Post-V1 integration target is **C Teleport** (developer.cteleport.com) — a documented REST API built specifically for crew management with marine fare support. C Teleport is right-sized for a 3-vessel fleet; ATPI is enterprise/relationship-driven with no public API and overkill. The `ct_passenger_id` field on crew_members and full `crew_travel` table are already spec'd for this integration (~28 hours dev estimate).

The **fleet calendar** view overlays travel events so you can see: "Relief for Jones on Vessel 2 is flying in June 14, vessel arrives port June 15 — that's a tight window, flag it."

### 2H. Change Portal — Shore-Side Expense Visibility

**The Problem**

Shore-side bookkeepers (e.g., Kelly at SANSU/Standing Tide) currently have zero visibility into travel expense changes. When a voyage delay causes a flight rebooking, when a crew member cancels, when a refund is pending — Kelly finds out when the credit card statement arrives, then has to reverse-engineer which crew member, which trip, and why. With ATPI costing ~$2,000/month ($24,000/year), they're paying a premium for this opacity.

**System Design — The Cost Event Model**

Every financial event related to crew travel is captured as a **cost event** in a dedicated `cost_events` table:
- **Booking:** Initial flight/hotel/ground transport booked for a crew member
- **Change:** Rebooking due to voyage delay, schedule change, or other reason — captures the cost delta
- **Cancellation:** Trip cancelled — captures reason, flags expected refund
- **Refund:** Refund initiated, tracked through pending → processing → credited lifecycle

Every cost event is linked to:
- A **crew member** (who is this expense for?)
- A **voyage** (which operational period does it relate to?)
- An **assignment** (which specific crew change?)
- A **reason** (why did this change happen?)
- An **approval chain** (who authorized it?)

**The Change Portal Dashboard**

Kelly's view into the system — no operational or watchstanding data, just the financial picture:

| View | Purpose |
|---|---|
| **Summary Cards** | Total booked, total changes, pending refunds, credited refunds, net spend |
| **All Events** | Chronological feed with expandable detail (vendor, PNR, flight info, cost delta, approval) |
| **By Voyage** | Events grouped by voyage with running totals — "Norfolk → Bermuda: $2,847 net" |
| **By Crew** | Events grouped by crew member — "Lisa Chen: booked $487, cancelled, refund credited, net $0" |
| **Refund Tracker** | Dedicated view: Pending / Processing / Credited buckets with amounts and expected dates |
| **CSV Export** | One-click export for bookkeeping software import |

**RLS Role: `finance`**

Kelly gets the `finance` role — she can see travel records, cost events, crew names, and voyage names, but nothing operational (watch logs, engineering data, etc.). She can create/edit cost events and travel financial fields but not crew assignments or operational data.

**Why This Wins the Deal**

Standing Tide currently pays ATPI ~$24,000/year for travel management with no programmatic visibility into changes. The Change Portal replaces that opacity with full, real-time, auditable expense tracking — tied directly to crew members and voyages — at zero incremental cost. Combined with HELM's ~$20,000/year, Standing Tide is looking at **$44,000/year** in software costs that this system eliminates.

---

## Pillar 3: Credential Management

### The Problem

A credentialed mariner carries a portfolio of documents, each with its own expiry, renewal process, regulatory body, and consequence for lapse. A single lapsed credential can:
- Make a mariner legally unable to stand their required watch
- Invalidate the vessel's Certificate of Inspection (COI) if the position can't be filled
- Expose the operator to USCG civil penalties

Tracking this in spreadsheets is how things get missed.

### Document Types

**Primary — USCG MMC (Merchant Mariner Credential)**
- The master license document — includes all endorsements
- 5-year renewal cycle
- Contains: officer endorsements (Mate 100 Ton, Master 500 Ton, etc.), ratings (OS, AB, QMED, etc.)
- Renewal requires: sea service, medical, drug test, training refreshers

**Medical Certificate (CG-719K)**
- Issued by USCG-designated physician
- 2-year validity for most mariners
- Required for any USCG credential holder in a safety-sensitive position

**TWIC (Transportation Worker Identification Credential)**
- TSA-issued, biometric card
- 5-year validity
- Required for unescorted access to secure maritime facilities

**STCW Certifications** (for vessels operating internationally or on ocean/near-coastal routes)
- Basic Safety Training (BST): fire, survival, first aid, personal safety — valid 5 years
- Advanced Fire Fighting — 5 years
- Medical First Aid / Medical Care
- GMDSS Radio Operator
- Proficiency in Survival Craft
- Officer of the Watch endorsement
- ECDIS training (increasingly required)

**Other Common Credentials**
- Radar Observer (Unlimited or Restricted)
- Able Seaman (Special, Limited, Unlimited, Sail)
- RFPNW (Rating Forming Part of a Navigational Watch)
- QMED endorsements (Oiler, Pumpman, etc.)
- Hazmat/HAZWOPER certifications
- CPR/First Aid (varies by position)
- Company-specific training records (vessel familiarization, ISM, security)
- Passport (for vessels transiting foreign ports)

### The Credential Matrix

Each **position** on each **vessel type** has a required credential set:

| Position | Required Credentials |
|---|---|
| Master | MMC (Master appropriate tonnage), Medical, TWIC, Radar Observer, STCW if applicable |
| Chief Mate | MMC (Mate), Medical, TWIC, Radar Observer, STCW if applicable |
| Chief Engineer | MMC (Chief Engineer, appropriate HP), Medical, TWIC |
| AB Watchstander | MMC (AB), Medical, TWIC, RFPNW (STCW), BST |
| Ordinary Seaman | MMC (OS), Medical, TWIC, BST |

This matrix is configurable per vessel type. When a mariner is proposed for a position, the system runs:
```
Does this mariner hold all credentials required by this position?
  → For each required credential:
      - Does the mariner have it? (credential exists in their record)
      - Is it currently valid? (not expired)
      - Is it the right grade/endorsement level?
  → If any check fails: BLOCK assignment, show which credential(s) are the issue
```

### Expiry Tracking & Alert Engine

**The Expiry Timeline**

Each credential record has:
- Issue date
- Expiry date
- Renewal lead time (how far in advance to start the renewal process — varies by credential)
- Renewal requirement notes (what the mariner needs to do to renew)
- Renewal status: `current → approaching → action_required → expired`

**Alert Schedule**

The system generates alerts at configurable thresholds before expiry:
- **90 days out:** Notification to mariner and company compliance officer — "Heads up, start preparing"
- **60 days out:** Second notice — "Time to schedule your medical / submit renewal"
- **30 days out:** Urgent notice — "This is expiring soon, status update required"
- **Expired:** Hard stop — credential flagged red, mariner blocked from new assignments requiring that credential

Alerts are delivered by:
- In-app dashboard (compliance calendar view — shows all upcoming expirations across the whole fleet on a timeline)
- Email notification to mariner
- Email notification to compliance officer / HR

**Compliance Dashboard**

The compliance dashboard gives operators a fleet-wide view:
- Red: expired credentials (requires immediate action)
- Yellow: credentials expiring within 90 days
- Green: all current
- Filter by: vessel, position, credential type, mariner name
- Export to PDF for audits or USCG inspections

### COI Alignment

The Certificate of Inspection specifies the minimum required complement — how many licensed officers, unlicensed crew, etc. The system knows the COI requirements per vessel and can surface a **COI compliance check** at any time:
- Is every required position filled for the current or upcoming voyage?
- Does every assigned mariner hold valid credentials for their position?
- Are any required positions open (no assignment)?

This is the checklist that has to be green before a vessel can legally sail.

---

## Pillar 4: Vessel Logging

### Design Philosophy Shift from Ferry Log

The PIWT wheelhouse log is designed around a single operating day with a clear Open/Close cycle. The Bender Boat logging architecture is fundamentally different:

**Voyage-centric, not day-centric.** A log entry belongs to a voyage and a watch period, not to a calendar day. Watches cross midnight. Days at sea don't have "openings" and "closings."

**Watch handoff as the atomic event.** The most important moment in a continuous watch rotation isn't noon or midnight — it's the watch relief. Every handoff is a formal record: the offgoing officer reports conditions and signs the watch log; the oncoming officer opens the next watch.

### 4A. Deck / Wheelhouse Log

**Watch Log Entry** — created for each watch period:
- Date/time (local and UTC)
- Vessel position (lat/lon, manual entry or GPS integration)
- Course steered
- Speed (GPS/log)
- Wind: direction, Beaufort scale
- Sea state: Douglas scale
- Visibility
- Weather (free text + coded)
- Barometric pressure and trend
- Engine status summary
- Traffic/navigation concerns noted
- Officer of the Watch (auto-populated from watch assignment)

**Course/Position Log** — within a watch, discrete entries for:
- Course alterations (time, from course, to course, reason)
- Position fixes (time, method — GPS/visual/celestial, position)
- Speed changes
- VTS/VHF reports (mandatory check-ins at certain waypoints)

**Event Log** — free-form but structured events during a watch:
- Anchoring operations (time, position, scope)
- Pilot boarding/departure
- Tug operations
- Crew overboard drill
- Safety drill (SOLAS/company required)
- Equipment failure
- Medical event
- Any other notable occurrence

**Watch Handoff Record** — formal transfer of watch:
- Outgoing OOW: conditions summary, any outstanding issues, equipment status — signs the watch log
- Incoming OOW: opens next watch, records time assumed watch

### 4B. Engineering Log

This is what Eric's engineering team will likely care most about. The engineering log is structured around rounds — periodic inspections of machinery spaces.

**Engineering Watch Rounds Template**

Configurable per vessel based on their plant. Typical entries:
- Main engine: RPM, oil pressure, oil temp, coolant temp, fuel consumption rate, vibration notes
- Generator(s): voltage, amperage, frequency, oil pressure, coolant temp
- Fuel tanks: sounding/level (port/stbd/center), consumption since last round
- Fresh water: tank levels, daily consumption
- Bilges: levels per compartment (dry / trace / inches — exact measurement logged)
- Bilge pumps: runtime, alarms
- Auxiliary systems: hydraulics, steering gear, bow thruster (if equipped)
- Alarms: any active alarms, acknowledged, action taken

**Round Templates** are configured per vessel and can include photo evidence (gauge photos, bilge photos) for any item.

**Round Frequency**
- Underway: typically every 4 hours (aligned with watch rotation)
- In port: every 8 hours or per company policy
- Anchored: per company policy, often every 4 hours

**Engineering Events**
- Equipment startup/shutdown (with hours logged for maintenance tracking)
- Fuel transfer operations
- Ballast/trim operations
- Lube oil changes and filter changes
- Belt/impeller replacements
- Any abnormal condition, action taken, resolution

### 4C. Ship's Rounds — Safety & Engineering Inspection

The Ship's Rounds is a formal combined safety and engineering walkthrough, distinct from the routine engineering watch round. Think of it as the daily "state of the vessel" inspection.

**Sections of a Ship's Round:**

**Bridge & Navigation**
- Navigation lights: functional check
- GMDSS equipment: EPIRB battery/hydrostatic release date, SART, VHF, MF/HF
- Radar: operational
- Charts: up to date (paper or ECS)
- Safety notices posted
- Certificate of Inspection: aboard and posted

**Deck / Exterior**
- Mooring lines / anchor gear: condition, proper rigging
- Deck watertight integrity: hatches, ports, vents
- Fire fighting equipment: extinguisher tags, hydrant pressure
- Life saving appliances: liferaft hydrostatic releases, expiry dates; immersion suits (count and condition); ring buoys with line
- Gangway/embarkation: secure, safety net in place
- Hull: visible condition, any damage noted

**Below Decks / Accommodation**
- Crew quarters: habitability, no safety hazards
- Galley: fire suppression system operational, grease trap condition
- Fire detection system: panel clear of faults
- Emergency lighting: functional

**Machinery Space**
- Bilge condition: levels, clean, no sheen
- Fire detection: operational
- Fixed CO2/FM-200 system: panel status, cylinder pressure
- Oil/water separator: operational, ORB up to date
- Fuel system: no leaks, tank vents clear

**Watch Wakeups**

Before completing ship's rounds, the officer conducting rounds is responsible for waking the oncoming watch with sufficient time to dress, eat, and relieve on time. The wakeup checklist ensures this is logged:

- List of crew members to be woken for the next watch (auto-populated from the watch schedule)
- Time each crew member was called
- Confirmation each crew member acknowledged the wakeup
- Any crew member who did not acknowledge triggers a follow-up note (second call or physical wakeup)

This creates an accountability record — if a relief is late, the log shows whether the wakeup was made on time or missed.

**Results & Actions**
- Each item: Pass / Fail / N/A / Requires Attention
- Any "Requires Attention" item generates a **corrective action record** with assigned responsible party and due date
- Corrective actions are tracked to closure
- Completed rounds can be exported as a PDF report for the vessel's official records

### 4D. Navigation Log / Passage Plan

For ocean and near-coastal passages, the navigation log captures the passage plan and actual track:
- Waypoints: planned vs. actual
- Departure waypoint, intermediate waypoints, destination
- Weather routing notes
- NOTAM/Nav warning acknowledgments
- Arrival reporting (USCG, port authority, customs)

### 4E. Official Log Book Entries

USCG regulations (46 CFR 113) require certain events to be entered in the official log book. The system tracks official log entries as a separate category:
- Births and deaths aboard
- Disciplinary actions
- Illness/injury
- Crewmember discharge or signing off
- Life-saving appliance drills
- Fire and emergency drills

These entries require the Master's signature and are the legal record.

---

## How the Four Pillars Connect

The real value of this system isn't any single pillar — it's the connections between them:

**Ship Schedule → Crew Assignments**
Creating a voyage with a required complement automatically generates open crew slots. The scheduler fills those slots from the available pool.

**Crew Assignments → Credential Check**
Before an assignment is confirmed, the credential engine verifies the mariner is qualified and compliant for that position on that vessel.

**Crew Assignments → Watch Rotation**
Once crew are assigned to a voyage, the watch rotation system can auto-generate the watch schedule for the passage, distributing watches fairly within rest-hour constraints.

**Watch Rotation → Work Hours Compliance**
Every watch generates a work hours record. The compliance engine continuously calculates each mariner's 24-hour and 7-day rest compliance, blocking violations before they happen.

**Watch Rotation → Engineering Log**
Each engineering watch round is timestamped to the watch period, giving a clear chain of custody for all engineering data.

**Voyage Completion → Sea Time**
When a voyage closes, sea time is automatically credited to every assigned mariner's record.

**Credential Expiry → Assignment Blocking**
An expired credential immediately surfaces in the compliance dashboard and blocks the mariner from future assignments requiring that credential until it's renewed.

**Ship's Rounds → Corrective Actions → Maintenance**
Items flagged in ship's rounds that require follow-up feed into the maintenance planning module (future phase), creating a traceable loop from inspection to repair to re-inspection.

---

## Data Model — Key Tables (Supabase)

```
vessels               — vessel records, COI data, official number
voyages               — voyage records (child of vessel)
positions             — defined crew positions per vessel type
crew_members          — all mariners in the system
credentials           — credential records (child of crew_member)
credential_types      — master list of credential types with renewal rules
position_credential_requirements — the credential matrix
assignments           — crew-to-voyage assignments
watch_schedule        — watch rotation records (child of voyage + assignment)
work_hour_records     — running work hours per mariner per voyage
deck_log_entries      — wheelhouse log entries (child of watch_schedule)
engineering_rounds    — engineering round records (child of watch_schedule)
ships_rounds          — ship's round inspection records (child of voyage)
corrective_actions    — items requiring follow-up from ship's rounds
travel_records        — travel itineraries (child of assignment)
cost_events           — financial events: bookings, changes, cancellations, refunds (child of crew_member + voyage)
drug_test_log         — drug test records (child of crew_member)
sea_time_ledger       — accumulated sea time credits (child of crew_member + assignment)
official_log_entries  — official log book entries (child of voyage)
```

---

## Build Phases

*Developer: Ops Normal AI LLC (Jim + Cam). Reference build: Ferry Log. Target: production-ready V1 in 10 weeks.*

### Phase 1 — Foundation (Weeks 1-3)
- Supabase schema: all core tables (vessels, voyages, crew, positions, credentials, assignments)
- Crew & credential management UI
- Credential matrix — position → required documents
- Compliance dashboard (expiry tracking, COI check)
- Double-booking enforcement — hard gate on assignment save, edge cases (transit time, partial-day overlaps) fully tested

### Phase 2 — Logging (Weeks 4-6)
- Watch rotation system with automatic schedule generation
- Work hours / fatigue compliance — rolling 24hr/7-day calculation, hard block on violations
- Deck/wheelhouse log with watch handoff (offgoing officer signs, oncoming opens)
- Engineering watch rounds with configurable templates per vessel
- Ship's rounds — multi-section checklist, watch wakeup log, corrective action records

### Phase 3 — Operations (Weeks 7-9)
- Sea time calculation (auto-credited at voyage close) and USCG sea service letter generator
- Drug test tracking — all five test types, random pool, 60-day break auto-flag
- Travel coordination module (manual entry V1)
- **Change Portal** — cost event tracking, shore-side expense dashboard (Kelly's view), refund lifecycle, CSV export, `finance` role with RLS
- Voyage close workflow
- Reporting and export (PDF logs, compliance reports, work hours reports)

### Phase 4 — V1 Polish & Handoff (Week 10)
- End-to-end QA across all three vessel configs
- Onboarding flow and vessel setup wizard
- User roles and permissions
- Documentation

---

### Post-V1 Roadmap (Phase 2 Product)
- Automated alerts (credential expiry, work hours approaching limit, drug test due)
- Maintenance planner connected to engineering log corrective actions
- C Teleport API integration (~28 hours) — marine fares, automated booking, real-time status to Change Portal
- Change Portal enhancements: budget forecasting, monthly expense reports, QuickBooks/Xero export
- API for future integrations
- Mobile-optimized watch entry for officers on the bridge

---

## Competitive Differentiation vs. HELM

| Capability | HELM | Bender Boat Solution |
|---|---|---|
| Annual cost (3 vessels, all modules) | ~$20,000+ (plus ~$24,000/yr ATPI travel mgmt = $44,000+/yr) | Build cost amortized, no per-vessel licensing, travel tracking built-in |
| Client data ownership | No (SaaS lock-in) | Yes (their Supabase instance) |
| Custom vessel configuration | Limited | Fully configurable |
| Crew management depth | Basic | Full rotation, travel, sea time, drug test, **expense tracking** |
| Work hours / fatigue compliance | Unknown | Built-in with hard enforcement |
| Sea time letters | Unknown | Automated generation |
| Custom integrations | No | Yes |
| White-label / resale | No | Yes |

---

*Document prepared by JettyLight / Tasklet — May 2026*
