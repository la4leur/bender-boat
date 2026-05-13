# Bender Boat — Crew Travel Integration Analysis

**Developer:** Ops Normal AI LLC  
**Client:** Standing Tide (Eric Bardot)  
**Date:** May 2026

---

## The Question

Can we integrate Bender Boat's crew assignment system with a maritime travel platform like ATPI or an ATS (Automated Travel Service) to automate crew travel booking?

**Short answer:** Yes — and **C Teleport** is the strongest integration candidate, with a documented public API purpose-built for exactly this use case. ATPI is the bigger name but operates as a managed TMC (Travel Management Company), not an API-first platform.

---

## Platform Comparison

### C Teleport — The API-First Option ✅

C Teleport is a self-service marine travel platform with a **fully documented REST API** at [developer.cteleport.com](https://developer.cteleport.com).

**What they offer:**
- Online booking of flights with **marine/seaman fares** (discounted airline tickets for seafarers)
- Hotels and trains
- Instant flight changes and cancellations without calling an agent
- Integration with crew management systems (COMPAS, Adonis HR, Cloud Fleet Manager, FL3XX, Leon Software)
- No setup fees
- 24/7 support

**Their API covers exactly what we need:**

| API Endpoint | What It Does | Maps To (Bender Boat) |
|---|---|---|
| **Upload Passengers** | Push crew profiles (name, passport, visa, preferences, home airport) | `crew_members` table |
| **Upload Crew Changes** | Push onsigner/offsigner records per vessel + port + date | `assignments` table (new assignment triggers this) |
| **Upload Travel Requests** | Submit specific travel needs (routes, dates, travelers) | Created when assignment is confirmed |
| **Pull Bookings** | Retrieve confirmed flight bookings | → writes to `crew_travel` table |
| **Sync Flights (webhook)** | C Teleport pushes booking updates to our server | Real-time updates to `crew_travel` |
| **Delete Travel Request** | Cancel before actioned | Assignment cancellation triggers this |

**Integration timeline (per C Teleport's docs):**
- Passenger data integration: ~4 hours
- Crew change integration: ~4 hours
- Booking data sync back: ~20 hours
- **Total: ~28 hours of dev work**

**Auth:** API key (`X-Api-Key` header)  
**Formats:** REST API, JSON, XML, CSV  
**Dev environment:** Full sandbox available for testing

---

### ATPI — The Enterprise TMC Option

ATPI has been doing maritime travel for 100+ years and works with major shipping companies (OSM, Wallem, NYK, GasLog). They offer two products:

**CrewHub** — self-service booking platform for group crew travel  
**CrewLink** — crew travel management with real-time tracking, scheduling, fatigue monitoring, and crisis response

**The challenge for Standing Tide:**
- ATPI is a **managed service / TMC**, not an API-first platform
- Their "integration with third party systems" is relationship-driven — you'd need a business agreement first
- They serve **enterprise-scale fleets** (hundreds of vessels, thousands of crew)
- 3 vessels with ~20-30 crew may not meet their engagement thresholds
- No public developer documentation — integration would require a commercial partnership
- ATPI quoted Standing Tide's competitor (HELM) at ~$20k/year — ATPI's own managed service would likely cost more, not less

**Bottom line:** ATPI makes sense for fleet operators running 50+ vessels. For Standing Tide's 3 Bender Class vessels, C Teleport is the right fit — lower barrier to entry, API-first, and purpose-built for exactly this integration pattern.

---

## How It Would Work — Architecture

### Phase 1: Manual (V1 Build — Weeks 1-10)

In V1, travel is tracked but not automated:

```
Assignment Created → Travel Status: "Needs Booking"
    ↓
Office books travel manually (phone, email, web)
    ↓
Enters travel details in Bender Boat:
  - Flight number, airline, departure/arrival
  - Hotel if needed
  - Ground transport
  - Status tracking (booked → confirmed → en route → arrived)
    ↓
Crew member's travel record linked to assignment
```

The `crew_travel` table captures everything — this is not throwaway work. It becomes the data layer that the API integration writes to in Phase 2.

### Phase 2: C Teleport Integration (Post-V1)

```
┌─────────────────────────────────────────────────────────┐
│                    BENDER BOAT SYSTEM                     │
│                                                           │
│  crew_members ──→ Upload Passengers ──→ C Teleport        │
│  (passport, visa,    (API push)         (passenger        │
│   home airport,                          profiles)        │
│   preferences)                                            │
│                                                           │
│  assignments ───→ Upload Crew Changes ──→ C Teleport      │
│  (new assignment     (API push)           (creates        │
│   triggers crew                            travel         │
│   change event)                            requests)      │
│                                                           │
│  crew_travel ←── Sync Flights ←────────── C Teleport      │
│  (booking details    (webhook push         (confirmed     │
│   auto-populated)     from C Teleport)      bookings,     │
│                                             changes,      │
│                                             cancellations)│
│                                                           │
│  Dashboard shows real-time travel status per crew member   │
└─────────────────────────────────────────────────────────┘
```

**The integration flow:**

1. **Crew profile sync** — When a crew member is added/updated in Bender Boat, their profile (name, passport, visa, home airport, seaman's book number) is pushed to C Teleport via Upload Passengers. Each crew member gets a `ct_passenger_id` stored in our `crew_members` table.

2. **Crew change trigger** — When an assignment is created with a future start date:
   - Bender Boat identifies the onsigner (new crew) and offsigner (departing crew)
   - Pushes a crew change record to C Teleport: vessel, port, date, onsigners/offsigners
   - C Teleport automatically creates travel requests for each crew member

3. **Booking confirmation** — C Teleport books flights (using marine fares) and pushes booking data back via webhook:
   - Flight details (carrier, flight number, route, times)
   - PNR / booking reference
   - Ticket numbers
   - Cost breakdown
   - All written to `crew_travel` linked to the assignment

4. **Change management** — If a voyage is delayed or an assignment changes:
   - Bender Boat updates the crew change in C Teleport
   - C Teleport handles flight rebooking
   - Updated booking syncs back automatically

5. **Dashboard visibility** — The Bender Boat dashboard shows:
   - Crew currently in transit (with live flight status)
   - Upcoming crew changes with travel status
   - Travel cost tracking per vessel/voyage
   - Alerts for unboooked travel on upcoming assignments

---

## Schema Additions for Travel Integration

```sql
-- Add to crew_members table
ALTER TABLE crew_members ADD COLUMN ct_passenger_id text;        -- C Teleport passenger ID
ALTER TABLE crew_members ADD COLUMN home_airport text;           -- 3-letter IATA code
ALTER TABLE crew_members ADD COLUMN seaman_book_number text;     -- For marine fare eligibility

-- Crew travel table (already in V1 schema, enhanced for integration)
CREATE TABLE crew_travel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id),
  crew_member_id uuid REFERENCES crew_members(id),
  
  -- Travel details
  direction text CHECK (direction IN ('to_vessel', 'from_vessel')),
  
  -- Flight info (populated manually in V1, auto-populated via API in V2)
  airline text,
  flight_number text,
  departure_airport text,      -- IATA code
  arrival_airport text,        -- IATA code
  departure_time timestamptz,
  arrival_time timestamptz,
  booking_reference text,      -- PNR
  ticket_number text,
  fare_type text,              -- 'marine', 'published', 'corporate'
  
  -- Multi-leg support
  legs jsonb,                  -- Array of flight legs for connections
  
  -- Hotel
  hotel_name text,
  hotel_checkin date,
  hotel_checkout date,
  
  -- Ground transport
  ground_transport text,       -- Notes on car, shuttle, etc.
  
  -- C Teleport integration fields
  ct_travel_request_id text,   -- C Teleport travel request ID
  ct_booking_id text,          -- C Teleport booking ID
  
  -- Cost tracking
  cost_amount decimal(10,2),
  cost_currency text DEFAULT 'USD',
  
  -- Status
  status text DEFAULT 'needs_booking' 
    CHECK (status IN ('needs_booking', 'requested', 'booked', 'confirmed', 
                      'checked_in', 'in_transit', 'arrived', 'cancelled')),
  
  -- Audit
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'c_teleport', 'atpi')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## Challenges & Mitigations

### 1. Volume Threshold
**Risk:** C Teleport may have minimum booking volumes for API access.  
**Mitigation:** Standing Tide has 3 vessels doing regular crew rotations — likely 50-100+ flights per year. Contact C Teleport early in the build to confirm API access eligibility. Their "no setup fees" and SMB-friendly positioning suggests this is workable.

### 2. Marine Fare Eligibility
**Risk:** Marine/seaman fares require verification of maritime employment status.  
**Mitigation:** Standing Tide is a legitimate maritime operator. Crew members have seaman's books and MMCs. Verification should be straightforward. Store seaman book numbers in `crew_members` for automated eligibility.

### 3. Two-Way Sync Edge Cases
**Risk:** Race conditions — what if an assignment is cancelled after travel is booked? What if C Teleport can't find flights?  
**Mitigation:**
- Cancellation flow: Assignment cancellation → API call to delete travel request → if already booked, trigger cancellation → sync refund status back
- No-result flow: C Teleport returns no options → `crew_travel.status` stays at `requested` → alert in dashboard → fall back to manual booking
- Conflict detection: If travel is already booked and assignment dates change, flag for review rather than auto-rebooking

### 4. Passport/Visa Data Sensitivity
**Risk:** Pushing crew passport data to a third party.  
**Mitigation:** C Teleport handles this for hundreds of shipping companies — they're built for it. Data encrypted in transit (HTTPS/SSL) and at rest. IP whitelisting available. Standing Tide's crew are already providing this data to travel agents manually — the API just removes the manual step.

### 5. Offline Operations
**Risk:** Vessel is offshore without reliable internet — can't sync travel changes.  
**Mitigation:** Travel management happens shoreside (office), not on the vessel. The watch officer doesn't need travel data — the office manager does. Office always has connectivity.

---

## Recommendation

### For V1 (Weeks 1-10):
Build `crew_travel` as a manual-entry table with full schema support. This is production-useful on day one — Eric's team enters travel details when they book, and the system tracks status, costs, and crew positioning.

### For V2 (Post-launch, ~2-3 weeks additional):
Integrate C Teleport's API. The schema is already designed for it — just wire up:
1. Passenger profile sync (4 hours)
2. Crew change → travel request automation (4 hours)  
3. Booking data sync back (20 hours)
4. Dashboard enhancements for live travel status

### Cost to Standing Tide:
- C Teleport: No setup fees, per-booking pricing (competitive with what they're paying travel agents today)
- Development: ~28 hours of Ops Normal AI LLC time
- Result: Crew assignments automatically trigger travel booking, travel confirmations flow back to the dashboard, and Eric sees real-time crew positioning across all three vessels

### ATPI Alternative:
If Standing Tide grows or wants a managed TMC relationship (dedicated travel consultant, 24/7 emergency support, duty of care compliance), ATPI is the premium option. But for 3 vessels, the API-first approach with C Teleport gives them automation without the enterprise overhead.

---

## References

- C Teleport Developer Portal: [developer.cteleport.com](https://developer.cteleport.com)
- C Teleport API Integration: [cteleport.com/product/automation/travel-api-integration](https://cteleport.com/product/automation/travel-api-integration/)
- C Teleport Integration Partners: [cteleport.com/product/automation/partners](https://cteleport.com/product/automation/partners/)
- ATPI Marine Travel: [atpi.com/marine-travel](https://www.atpi.com/marine-travel/)
- ATPI CrewHub: [atpi.com/products/atpi-crewhub](https://www.atpi.com/products/atpi-crewhub/)
- ATPI CrewLink: [atpi.com/products/atpi-crewlink](https://www.atpi.com/products/atpi-crewlink/)
