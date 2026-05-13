# Bender Boat — Vessel Operations Architecture

## Config Differences vs. PIWT

The Bender Boat config disables all passenger/sales features and enables offshore/underway features:

```js
operations: {
  mode: 'voyage',            // not 'day'
  hasPOS: false,
  hasPassengers: false,
  hasCrossings: false,
  hasCash: false,
  hasWatches: true,
  watchType: 'continuous',   // not 'shift'
  hasEngineeringRounds: true,
  hasShipsRounds: true,
  hasNavigationLog: true,
  hasCrewManagement: true,
}
```

Same codebase. No fork. Feature flags do the work.

---

## 1. Voyage Mode (replaces Day Mode)

| PIWT Day Mode | Bender Boat Voyage Mode |
|---|---|
| Opens each morning, closes each night | Voyage opens at departure, closes at arrival |
| Single date | Multi-day/week span |
| Simple open/close lifecycle | Voyage → Legs → Watches hierarchy |
| Watches optional | Watches are the primary time unit |

### Voyage Lifecycle
```
Voyage Created
  ├── Departure port, date/time
  ├── Destination port (or patrol area)
  ├── Expected duration
  └── Legs (port calls, waypoints)
        └── Watches (continuous, 4-8 hrs each)
              ├── On-watch crew
              ├── Log entries
              ├── Engineering readings
              └── Relief handoff record
```

---

## 2. Continuous Watch System

### Watch Types (configurable per vessel)
- **4-on / 8-off** — standard bridge watch
- **6-on / 6-off** — common on smaller vessels
- **4-on / 4-off** — high-demand ops
- Custom durations configurable

### Watch Record Structure
```
Watch {
  id
  voyage_id
  watch_number         // sequential across voyage
  type                 // bridge, engineering, combined
  start_datetime
  end_datetime
  on_watch_officer     // crew_id (OOW)
  on_watch_crew[]      // additional crew_ids
  relief_officer       // crew_id
  handoff_confirmed_by_relieving_officer  // bool + timestamp
  handoff_confirmed_by_relieved_officer   // bool + timestamp
  status               // active | relieved | emergency
  log_entries[]
  engineering_readings{}
  notes
}
```

### Watch Relief Handoff
Both officers must confirm the handoff — creates a digital record:
1. Relieving officer opens handoff screen, reviews conditions
2. Outgoing officer confirms ready to be relieved
3. Both confirm → watch transfers, log entry created
4. System tracks crew rest time (STCW compliance)

### STCW Rest Hour Tracking
- Logs rest hours per crew member per voyage
- Flags violations (< 10 hrs rest in 24 hrs, < 77 hrs in 7 days)
- Required for US/international compliance

---

## 3. Engineering Rounds (Promoted to Core)

Unlike PIWT where engineering is a secondary tab, Bender Boat makes engineering rounds a first-class feature.

### Engineering Round Record
```
EngineeringRound {
  id
  watch_id
  voyage_id
  timestamp
  engineer_id
  plant_readings {
    main_engine_rpm
    main_engine_oil_pressure
    main_engine_coolant_temp
    main_engine_exhaust_temp
    gear_oil_pressure
    generator_1_load
    generator_2_load
    bilge_levels {}
    fuel_consumption
    fuel_remaining
  }
  gauge_photos[]       // camera capture attached to reading
  anomalies[]          // flags for out-of-range readings
  notes
}
```

### Configurable Plant Templates
Each vessel has its own engineering template (number of engines, generators, tanks, etc.) defined in Supabase and loaded at runtime.

### Automated Alerts
- Out-of-range readings trigger in-app alert + log entry
- Critical readings (low oil pressure, high temp) escalate to master

---

## 4. Ship's Rounds (Safety + Engineering Walkthrough)

A structured, multi-section inspection — not a quick check but a documented walkthrough.

### Rounds Structure
```
ShipsRound {
  id
  voyage_id
  timestamp
  conducted_by         // crew_id
  round_type           // scheduled | unscheduled | emergency
  sections {
    bridge {
      nav_equipment_ok
      comms_equipment_ok
      charts_current
      notes
    }
    deck {
      mooring_lines_ok    // or if underway: deck_secured
      lifesaving_equipment_ok
      fire_equipment_ok
      hatches_secured
      photos[]
      notes
    }
    below_decks {
      bilges_checked
      bilge_levels_normal
      sea_cocks_ok
      flooding_signs: false
      photos[]
      notes
    }
    safety_systems {
      fire_detection_ok
      co2_system_ok
      epirb_armed
      liferaft_ok
      immersion_suits_accessible
      notes
    }
    engineering_space {
      see: EngineeringRound  // linked
    }
  }
  deficiencies[]         // items flagged for follow-up
  corrective_actions[]
  master_reviewed        // bool + timestamp
}
```

### Configurable Frequency
- Minimum frequency set per vessel type (e.g., every 4 hrs underway)
- Overdue rounds flagged on dashboard
- Watch officer responsible for initiating round

---

## 5. Navigation Log

Replaces/supplements the simple position log in PIWT.

### Entry Types
- **Course change** — new heading, speed, reason
- **Position fix** — GPS, visual, radar, celestial
- **Weather observation** — sea state, wind, visibility, barometer
- **VTS report** — traffic separation scheme check-ins
- **Anchoring** — anchor down/up, position, depth, scope
- **Pilot operations** — pilot on/off, boarding location
- **Hazard** — traffic, debris, ice, shallow water
- **Communication log** — ch16 calls, GMDSS, sat phone

---

## 6. Dashboard Differences

| PIWT Dashboard | Bender Boat Dashboard |
|---|---|
| Today's ticket count | Current voyage day/status |
| Daily revenue | Fuel consumption rate |
| Passenger count | Current watch officer |
| Next departure time | Time to next watch relief |
| — | Next engineering round due |
| — | Next ship's round due |
| — | STCW rest violations (if any) |
| — | Crew compliance status |

---

## Build Estimate

| Module | Effort |
|---|---|
| Voyage mode / config flags | 2 days |
| Continuous watch system | 5 days |
| Watch handoff + STCW tracking | 3 days |
| Engineering rounds + templates | 4 days |
| Ship's rounds | 3 days |
| Navigation log | 2 days |
| Dashboard redesign | 2 days |
| **Total** | **~21 days** |

Watch system is the most complex piece — continuous rotation + handoff logic + rest tracking.
