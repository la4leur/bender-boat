# Weekly Crewing Report — Data Element Analysis

## Source Document
**"Shipboard Crewing Update: 5/4/26"** — sent by Samantha Kelley (Standing Tide Logistics Manager) every Monday to:
- 43 recipients: department heads across 4 Lindblad vessels (Quest, Sea Bird, Sea Lion, Venture) + Lindblad shore-side staff
- 10 CC: Standing Tide leadership (Eric Bardot, Kelly Paulson, Ian Holtzworth, Jim Andrews, etc.)

## What the Report Contains

Sam produces **5 deliverables** every Monday, manually:

### 1. Comings & Goings Spreadsheet (4 vessel tabs, ~1,600 rows total)

Per vessel, a date-ordered table through June 30 showing every crew change:

| Data Element | Description | In V1 Schema? |
|---|---|---|
| **Date** | Crew change date | ✅ `crew_changes.change_date` |
| **Location** | Port name (e.g., "Balboa, Panama", "Portland, OR") | ✅ `ports` table |
| **Embarking Name** | Crew member joining | ✅ `crew_members.full_name` |
| **Embarking Position** | Role on vessel | ✅ `positions.title` |
| **Flight Booked** | TRUE/FALSE | ⚠️ Need: `travel_bookings.flight_status` |
| **Hotel Booked** | TRUE/FALSE | ⚠️ Need: `travel_bookings.hotel_status` |
| **VISA** | TRUE/FALSE/blank | ✅ `crew_credentials` (visa type) |
| **Disembarking Name** | Crew member departing | ✅ `crew_members.full_name` |
| **Disembarking Position** | Role being vacated | ✅ `positions.title` |
| **Disembark Flight Booked** | TRUE/FALSE | ⚠️ Need: `travel_bookings.flight_status` |
| **Disembark Hotel Booked** | TRUE/FALSE | ⚠️ Need: `travel_bookings.hotel_status` |
| **Notes** | Free-text (awaiting confirmation, etc.) | ⚠️ Need: `crew_changes.notes` |
| **Touch-base Email Sent** | Bold name = email sent | ⚠️ Need: `travel_communications.touchbase_sent` |

### 2. LEX Unfilled Billets (Overview + 14 weekly tabs)

Weekly per-vessel breakdown of every position that was unfilled, by day:

| Data Element | Description | In V1 Schema? |
|---|---|---|
| **Vessel** | Which ship | ✅ `vessels` |
| **Position** | Billet name (e.g., "Engine Mechanic", "Seasonal Steward 3") | ⚠️ Need: `vessel_billets` — defined required positions |
| **Day 1-7** | 1 = unfilled, blank = filled | ⚠️ Need: computed from billet assignments |
| **Total Unfilled Billet Days** | Sum per position per week | ⚠️ Derived |
| **Notes** | Context: "Terminated 3/3", "Embarking 2/23", "Medical disembarkation" | ⚠️ Need: `crew_events` log |
| **Clearance Issues flag** | Per vessel per week | ⚠️ Need: `vessel_notes` or flags |
| **Repositioning/Wet Dock** | Vessel operational status | ⚠️ Need: `vessel_status_periods` |

### 3. Unfilled Billets Trend Graph

Line chart: unfilled billet days per vessel per week over 14 weeks.

| Data Element | Description | In V1 Schema? |
|---|---|---|
| **Weekly totals** | Sum of unfilled billet days per vessel | ⚠️ Derived from billet tracking |
| **Fleet total** | Sum across all vessels | ⚠️ Derived |

*This auto-generates from the billet data — no separate tracking needed.*

### 4. Open Positions Table (email body)

All unfilled billets with recruitment status:

| Data Element | Description | In V1 Schema? |
|---|---|---|
| **Title** | Position name | ✅ `positions.title` |
| **Ship(s)** | Vessel code (QT/SB/SL/VE) | ✅ `vessels` |
| **Rotation** | Named rotation (e.g., "Former Garcia", "Meland") | 🔴 Need: `rotations` — named rotation slots |
| **Dept** | Department (Deck, Engine/Tech, Hotel, Galley) | ✅ `departments` |
| **Date Needed** | When the position must be filled | ⚠️ Need: `open_positions.date_needed` |
| **Anticipated Embarkation Date** | When candidate will board | ⚠️ Need: `open_positions.anticipated_embark_date` |
| **Type** | Full-Time / Seasonal / Temporary | 🔴 Need: `employment_types` or field |
| **Comment/Status** | Candidate name + pipeline status | 🔴 Need: `candidates` pipeline |

Candidate pipeline statuses observed in Sam's report:
- *(blank)* — No candidate identified
- "Candidate identified" (yellow highlight in original)
- "Need to Send Offer"
- "Awaiting Signature"
- "Offer Signed"
- "Fill-In" — temporary placement while recruiting

### 5. Onboarding Table (email body)

All new hires/fill-ins currently in onboarding:

| Data Element | Description | In V1 Schema? |
|---|---|---|
| **Embarking Ship** | Which vessel | ✅ `vessels` |
| **First/Last Name** | Crew member | ✅ `crew_members` |
| **Position Title** | Role | ✅ `positions.title` |
| **Hire Type** | New Hire / Rehire / Fill-In / Promotion | 🔴 Need: `crew_members.hire_type` or `onboarding.hire_type` |
| **Employment Type** | Full-Time Rotational / Seasonal / Temporary | 🔴 Need: `employment_type` field |
| **Department** | Deck / Engine / Hotel / Galley | ✅ `departments` |
| **Start/Travel Date** | When they travel to the vessel | ⚠️ Need: `onboarding.travel_date` |
| **Embarkation Date** | When they board | ✅ `crew_changes.change_date` |
| **Rotation Name** | Which rotation slot | 🔴 Need: `rotations` |
| **Manager** | Reporting officer (Cap., CM, CE, HM, HC) | ⚠️ Need: `positions.reports_to` |
| **Onboarding Complete** | Green = done | 🔴 Need: `onboarding.status` + checklist |

---

## Schema Additions Needed

### Already in V1 (No Changes)
- `vessels` — ship profiles ✅
- `crew_members` — personnel records ✅
- `positions` — job titles and departments ✅
- `crew_changes` — embark/disembark events ✅
- `crew_credentials` — visa/STCW/MMC tracking ✅
- `ports` — locations ✅
- `departments` — organizational structure ✅

### New Tables Required

#### 1. `vessel_billets` — Required Positions Per Vessel
```sql
CREATE TABLE vessel_billets (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  position_title TEXT NOT NULL,        -- "Engine Mechanic", "Seasonal Steward 3"
  department TEXT NOT NULL,             -- Deck, Engine, Hotel, Galley
  rotation_name TEXT,                   -- "Former Garcia", "Meland", "Rodriguez"
  employment_type TEXT NOT NULL,        -- 'full_time_rotational', 'seasonal', 'temporary'
  is_required BOOLEAN DEFAULT true,     -- vs. optional/seasonal
  effective_from DATE,
  effective_to DATE,                    -- NULL = ongoing
  notes TEXT
);
```
*This defines "what positions SHOULD exist" — the org chart per vessel.*

#### 2. `billet_assignments` — Who Fills Each Billet
```sql
CREATE TABLE billet_assignments (
  id UUID PRIMARY KEY,
  billet_id UUID REFERENCES vessel_billets(id),
  crew_member_id UUID REFERENCES crew_members(id),
  assigned_from DATE NOT NULL,
  assigned_to DATE,                     -- NULL = current
  assignment_type TEXT,                 -- 'permanent', 'fill_in', 'transfer'
  notes TEXT
);
```
*Unfilled billets = billets with no active assignment for a given date range.*

#### 3. `recruitment_pipeline` — Open Position Tracking
```sql
CREATE TABLE recruitment_pipeline (
  id UUID PRIMARY KEY,
  billet_id UUID REFERENCES vessel_billets(id),
  status TEXT NOT NULL,                 -- 'open', 'candidate_identified', 'offer_pending',
                                        -- 'offer_sent', 'awaiting_signature', 'offer_signed',
                                        -- 'onboarding', 'filled'
  candidate_name TEXT,
  candidate_id UUID REFERENCES crew_members(id),  -- NULL until matched
  date_needed DATE,
  anticipated_embark_date DATE,
  hire_type TEXT,                        -- 'new_hire', 'rehire', 'fill_in', 'promotion'
  notes TEXT,
  updated_at TIMESTAMPTZ
);
```

#### 4. `onboarding_checklists` — Onboarding Pipeline
```sql
CREATE TABLE onboarding_checklists (
  id UUID PRIMARY KEY,
  crew_member_id UUID REFERENCES crew_members(id),
  vessel_id UUID REFERENCES vessels(id),
  position_title TEXT,
  hire_type TEXT NOT NULL,              -- 'new_hire', 'rehire', 'fill_in', 'promotion'
  employment_type TEXT NOT NULL,        -- 'full_time_rotational', 'seasonal', 'temporary'
  travel_date DATE,
  embarkation_date DATE,
  rotation_name TEXT,
  manager_role TEXT,                    -- 'Cap.', 'CM', 'CE', 'HM', 'HC'
  status TEXT DEFAULT 'in_progress',    -- 'in_progress', 'complete'
  items JSONB,                          -- checklist items with completion status
  created_at TIMESTAMPTZ
);
```

#### 5. `crew_events` — Event Log
```sql
CREATE TABLE crew_events (
  id UUID PRIMARY KEY,
  crew_member_id UUID REFERENCES crew_members(id),
  vessel_id UUID REFERENCES vessels(id),
  event_type TEXT NOT NULL,             -- 'termination', 'resignation', 'medical_disembark',
                                        -- 'loa', 'transfer', 'family_emergency', 'promotion'
  event_date DATE NOT NULL,
  notes TEXT,
  related_billet_id UUID REFERENCES vessel_billets(id)
);
```
*This powers the "Notes" column in unfilled billets — "Terminated 3/3", "Medical disembarkation 2/15", etc.*

#### 6. `vessel_status_periods` — Operational Status
```sql
CREATE TABLE vessel_status_periods (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  status TEXT NOT NULL,                 -- 'operational', 'repositioning', 'wet_dock', 'dry_dock'
  start_date DATE,
  end_date DATE,
  notes TEXT
);
```

#### 7. Field additions to existing tables

```sql
-- crew_changes: add travel tracking
ALTER TABLE crew_changes ADD COLUMN flight_booked BOOLEAN DEFAULT false;
ALTER TABLE crew_changes ADD COLUMN hotel_booked BOOLEAN DEFAULT false;
ALTER TABLE crew_changes ADD COLUMN visa_cleared BOOLEAN;
ALTER TABLE crew_changes ADD COLUMN touchbase_email_sent BOOLEAN DEFAULT false;
ALTER TABLE crew_changes ADD COLUMN notes TEXT;

-- crew_members: add employment classification
ALTER TABLE crew_members ADD COLUMN employment_type TEXT;  -- full_time_rotational, seasonal, temporary
ALTER TABLE crew_members ADD COLUMN hire_type TEXT;          -- new_hire, rehire, fill_in, promotion
```

---

## Report Generation Logic

### "Generate Weekly Crewing Report" — One Button

**Step 1: Comings & Goings (Excel, 4 tabs)**
```
FOR each vessel:
  SELECT crew_changes
  WHERE change_date BETWEEN now() AND end_of_quarter
  JOIN crew_members ON crew_id
  JOIN positions ON position_id
  ORDER BY change_date
  
  → Pivot into Embarking | Disembarking columns per date
  → Include flight_booked, hotel_booked, visa_cleared status
  → Bold names where touchbase_email_sent = true
```

**Step 2: Unfilled Billets (Excel, overview + weekly tabs)**
```
FOR each week in reporting period:
  FOR each vessel:
    FOR each billet WHERE is_required = true:
      Check billet_assignments for each day in the week
      IF no active assignment → mark as unfilled (1)
      Pull most recent crew_event for context notes
    
    → Calculate total unfilled billet days per position
    → Sum to vessel total

→ Overview tab: weekly totals per vessel + fleet total
→ Generate trend line chart from historical data
```

**Step 3: Open Positions (email body table)**
```
SELECT vessel_billets b
JOIN recruitment_pipeline r ON b.id = r.billet_id
WHERE r.status NOT IN ('filled')
ORDER BY vessel, department, date_needed
```

**Step 4: Onboarding (email body table)**
```
SELECT onboarding_checklists o
JOIN crew_members c ON o.crew_member_id = c.id
WHERE o.status != 'complete'
  AND o.embarkation_date >= now() - 7 days
ORDER BY vessel, embarkation_date
```

**Step 5: Compile & Send**
- Generate Excel workbook (openpyxl) with C&G + Billets tabs
- Generate trend chart (matplotlib or chart.js server-side)
- Compose email with Open Positions + Onboarding tables as HTML
- Attach spreadsheets + chart image
- Send to configured distribution list

---

## V1 Readiness Assessment

| Report Section | Data Available at V1 Launch? | Effort to Add |
|---|---|---|
| **Comings & Goings** | 85% — need travel booking status fields | Low (field additions) |
| **Unfilled Billets** | 40% — need billet definitions + assignment tracking | **Medium** (2 new tables + logic) |
| **Trend Graph** | 0% at launch, 100% after 2 weeks of data | Auto-generated |
| **Open Positions** | 30% — need recruitment pipeline | **Medium** (1 new table) |
| **Onboarding** | 20% — need onboarding checklist system | **Medium** (1 new table) |
| **Email Assembly** | 0% — but trivial to build | Low (template + send) |

### Verdict: **YES — with ~2 additional development days**

The core V1 schema handles crew, vessels, positions, changes, and credentials. We need to add:

1. **Billet management** (~4 hours) — defining required positions per vessel
2. **Billet assignment tracking** (~3 hours) — who fills each slot and when
3. **Recruitment pipeline** (~4 hours) — tracking candidates through offer stages
4. **Onboarding checklists** (~3 hours) — hire type, employment type, completion tracking
5. **Event log** (~2 hours) — terminations, transfers, medical, LOA
6. **Report generator** (~6 hours) — Excel assembly, chart generation, email formatting

**Total: ~22 hours = ~2.5 development days**

This fits comfortably into the V1 timeline. These tables are straightforward CRUD — no complex business logic, no external integrations. The hardest part is the Excel formatting to match Sam's current layout (which we don't need to match exactly — we can improve on it).

---

## What We Improve Over Sam's Current Process

| Today (Manual) | With Our System |
|---|---|
| Sam manually updates 4 Excel tabs every week | Auto-generated from crew change data |
| Billet tracking requires cross-referencing multiple spreadsheets | System knows defined positions vs. assigned crew |
| "Bold = email sent" tracked by manually bolding names | `touchbase_email_sent` flag, auto-set when travel packet pushes |
| Candidate pipeline status in free-text comments | Structured pipeline with status dropdowns |
| Onboarding completion tracked separately | Checklist built into crew profile |
| Trend chart manually updated in Excel | Auto-generated from historical data |
| Notes about terminations/transfers scattered across emails | Structured event log with timestamps |
| Visa/clearance status checked manually | Integrated with credential tracking system |
| Distribution list maintained manually | Configured once, automated delivery |
| Takes Sam **hours every Monday morning** | Takes **one click** |

---

## Pitch Implication

This weekly report is the **heartbeat of Standing Tide's crew management contract**. It goes to every department head on every vessel plus all of Lindblad's shore-side management.

When Eric sees that this report — which currently consumes half of Sam's Monday — becomes a button press, and that the data feeding it is the same data powering crew changes, travel logistics, credential tracking, and Lifeline... that's the moment he understands this isn't just a HELM replacement. It's the operating system for his entire business.

**The close:**
> *"Sam spends hours every Monday morning building this report from four different spreadsheets. Your system generates it automatically because the data already exists — crew changes, travel bookings, billet assignments, onboarding status. One button. Same report. Zero manual assembly. And the trend graph updates itself."*
