# Bender Boat Solution — Context Brief

> **Developer:** Ops Normal AI LLC  
> **Client:** Standing Tide (Eric Bardot) — SANSU, 3 Bender Class vessels  

## What This Is

The **Bender Boat Solution** is a vessel operations and crew management platform designed for commercial vessels that:
- Do **not** do passenger sales or require a POS integration
- Operate for **days or weeks underway** (continuous watch schedules)
- Have **dynamic, rotating crews** with complex credentialing and travel logistics

This is a sister product to the PIWT/HELM wheelhouse log platform, sharing the same config-driven architecture but with a fundamentally different operational profile.

---

## Origin

Concept developed from a conversation with **Eric at Standing Tide** (see `standing-tide-bender-boats.md`), whose wish list mapped almost perfectly to this design:
- Crew scheduling and rotation
- Double-booking prevention
- Available mariner pool / relief pool dashboard
- Credential compliance tracking (MMC, Med Cert, TWIC, STCW, passport, etc.)
- Expiry tracking with alerts
- Travel coordination (crew to vessel and home)
- Deck & Engine Logs

---

## Product Tracks

### Track 1: Vessel Operations (Wheelhouse / Engineering Log)
See `bender-boat-architecture.md`

Key differences from PIWT:
- **No POS, no cash, no passenger crossings** — eliminated via config flags
- **Voyage mode** replaces day mode (multi-day/week operations)
- **Continuous watch rotation** (4-on/8-off, 6-on/6-off, etc.) replaces AM/PM shifts
- **Engineering rounds** promoted to core (not optional tab)
- **Ship's rounds** — combined safety + engineering walkthrough inspection
- **Navigation log** — course changes, weather, position fixes, VTS reports, anchoring

### Track 2: Crew Management System
See `bender-boat-crew-management.md`

The real product. Crew management is where the operational pain and commercial value lives.
- All crew by position stored in Supabase
- Full document/credential management with expiry tracking
- Position assignment and rotation management
- Relief crew overlap planning
- Travel coordination (to vessel and home)
- Integration with vessel operations logs

---

## Technical Foundation

- **Same codebase as PIWT/HELM** — no fork required
- Config-driven: `operations.config` flags gate all features
- Supabase backend for crew data, documents, assignments
- Onboarding wizard COI scan auto-detects vessel type and seeds config
- ~21 days estimated build for vessel operations layer
- Crew management system is a larger, separate build estimate TBD

---

## Key People

- **Eric (Standing Tide)** — prospective customer, provided detailed wish list aligned to this design
- **Jim Andrews** (jim@jettylight.com) — product owner / developer

---

## Status

- Architecture designed ✅
- Crew management system designed ✅  
- Eric's requirements mapped ✅
- Build not yet started
- PIWT/HELM build finishing in parallel (separate agent)
