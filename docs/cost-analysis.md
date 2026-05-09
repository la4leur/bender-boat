# Bender Boat Solution — Cost to Develop & Administer

**Prepared by:** Ops Normal AI LLC
**Date:** May 8, 2026
**Client:** Standing Tide / SANSU (Eric Bardot)

---

## 1. Development Cost (V1 — 10 Weeks)

### Labor
| Role | Weeks | Hours/Wk | Rate | Total |
|------|-------|----------|------|-------|
| Jim (Lead / Full-Stack) | 10 | ___ | $___/hr | $ ___ |
| Cam (Full-Stack) | 10 | ___ | $___/hr | $ ___ |
| **Labor Subtotal** | | | | **$ ___** |

> **Note:** Fill in your actual rates. At market rate (~$150/hr for senior maritime-domain devs), 10 weeks × 2 devs × 30 hrs/wk = **$90,000**. At a friends-and-family rate or if you're pricing for equity/ongoing relationship, adjust accordingly.

### Development Tools & Services (During Build)
| Item | Cost | Notes |
|------|------|-------|
| Supabase Pro | $25/mo × 3 mo | Start Pro from week 1 for branch/preview DBs |
| Tasklet AI (this agent) | Current plan | Already in use |
| GitHub (la4leur) | Free | Private repos on free tier |
| cPanel hosting | $0 incremental | Already provisioned at sandbox.opsnormal.ai |
| Domain (production) | ~$15/yr | e.g., crew.sansu.com or app.standingtide.com |
| Vercel / Netlify (if SPA) | Free tier | Or continue cPanel for static deploy |
| **Dev Tools Subtotal** | **~$100** | Negligible |

### Development Total
| Component | Estimate |
|-----------|----------|
| Labor | $ ___ (your rates) |
| Tools/Infra | ~$100 |
| **V1 Development Total** | **$ ___** |

---

## 2. Monthly Infrastructure Cost (Production)

Once deployed and running for all 3 SANSU vessels:

| Service | Monthly | Annual | Notes |
|---------|---------|--------|-------|
| **Supabase Pro** | $25 | $300 | Database, auth, realtime, storage. Pro tier handles 3 vessels / ~50 crew easily. May never need to upgrade. |
| **cPanel Hosting** | $0–$15 | $0–$180 | Already have cPanel. If dedicated subdomain on existing plan, $0. |
| **Domain** | ~$1.25 | ~$15 | Already covered |
| **SMS (Office@Hand)** | $0 | $0 | Travel packet push, watch alerts via existing Office@Hand account — no additional cost |
| **Email (transactional)** | ~$0–5 | ~$0–60 | Supabase built-in or Resend free tier (3k emails/mo) |
| **SSL Certificate** | $0 | $0 | Let's Encrypt / cPanel AutoSSL |
| **Backups** | $0 | $0 | Supabase daily backups included in Pro |
| **CDN** | $0 | $0 | Cloudflare free tier |
| **Monthly Infra Total** | **~$25–45** | **~$300–540** | |

### Post-V1 Add-ons (When Wired)
| Service | Monthly | Annual | Notes |
|---------|---------|--------|-------|
| C Teleport API | $0 base | Pay-per-booking | Their API is free to query; you pay the ticket price. No subscription fee — that's the whole point vs. ATPI/D-A. |
| Gusto API (crew sync) | $0 | $0 | Read-only via their API; included in SANSU's existing Gusto plan |
| **Post-V1 Infra Total** | **~$25–45** | **~$300–540** | Same — the integrations don't add hosting cost |

---

## 3. Ongoing Administration Cost

### Monthly Maintenance Hours
| Task | Hours/Mo | Notes |
|------|----------|-------|
| Supabase monitoring & DB maintenance | 1–2 | Check logs, row counts, query performance |
| Bug fixes / minor UI tweaks | 2–4 | Normal maintenance cadence |
| Credential expiry monitoring | 0.5 | Automated alerts do the heavy lifting |
| Backup verification | 0.5 | Spot-check Supabase backups |
| Security patches / dependency updates | 1–2 | Monthly npm audit + Supabase updates |
| User support (Standing Tide team) | 1–2 | Kelly, crew, watch officers |
| **Monthly Admin Total** | **6–11 hrs** | |

### Admin Cost
| Scenario | Monthly | Annual |
|----------|---------|--------|
| At $150/hr (contract rate) | $900–$1,650 | $10,800–$19,800 |
| At $100/hr (retainer rate) | $600–$1,100 | $7,200–$13,200 |
| Bundled retainer (flat) | $1,000–$1,500 | $12,000–$18,000 |

> **Recommendation:** Offer a flat monthly retainer of **$1,000–$1,500/mo** that covers maintenance + support + minor enhancements. Major feature work (Phase 2 items like C Teleport integration, fleet expansion) billed separately.

---

## 4. Total Cost of Ownership — 5-Year View

### Their Current Stack
| Service | Annual | 5-Year |
|---------|--------|--------|
| HELM (vessel ops) | ~$20,000 | $100,000 |
| D-A / Atriis (travel) | ~$25,200 ($1,600/mo base + $10/PNR) | $126,000 |
| **Current Total** | **~$45,200** | **$226,000** |

*And they still have the "mystery refund" problem. No unified system. No crew change workflow. No visa tracking.*

### Our Solution — Blended Subscription + PNR Model

| Phase | Subscription | PNR Fee | Est. Annual (3 vessels, ~200 PNRs/yr) |
|-------|-------------|---------|---------------------------------------|
| Phase 1: Ops + Crew + Travel | $1,880/mo ($22,600/yr) | $20/PNR | **~$26,600/yr** |
| Phase 2: + Engineering | $3,000/mo ($36,000/yr) | $20/PNR | **~$40,000/yr** |

#### PNR Service Fee Justification ($20/PNR covers)
- C Teleport marine fare sourcing
- Lifeline AI auto-rebooking (4 AM incidents resolved without human intervention)
- Full cost event tracking (every change, cancellation, refund attributed to crew + voyage)
- Travel packet generation + push (SMS/email with token-based portal)
- Ground logistics coordination (pickup sequencing, hotel routing)
- *Compare: D-A charges $10/PNR and provides none of the above*

### 5-Year Comparison
| Solution | 5-Year Total |
|----------|-------------|
| **HELM + D-A/Atriis** | **$226,000** |
| **Ops Normal (Phase 1 + PNR)** | **~$133,000** |
| **Savings** | **~$93,000 (41%)** |

### Side-by-Side
| | HELM + D-A | Ops Normal AI |
|---|---|---|
| Annual Cost (Phase 1) | $45,200 | ~$26,600 |
| 5-Year Cost | $226,000 | ~$133,000 |
| Day-One Savings | — | 41% |
| Unified System | ❌ | ✅ |
| Crew Change Workflow | ❌ | ✅ |
| Change Portal (Finance) | ❌ | ✅ |
| Travel Packets & Visa Tracking | ❌ | ✅ |
| Ground Logistics & Hotel Picker | ❌ | ✅ |
| Lifeline AI Auto-Rebooking | ❌ | ✅ |
| Gusto Crew Sync | ❌ | ✅ |
| Data Portability | ❌ | ✅ |
| Tailored to SANSU Ops | ❌ | ✅ |

> **$93,000 less over 5 years. 41% savings on day one. Infinitely more product. Full data ownership.**

---

## 5. What They Get That HELM + D-A Don't Provide

| Capability | HELM | D-A/Atriis | **Ours** |
|------------|------|-----------|----------|
| Vessel ops (watch, rounds, nav) | ✅ | ❌ | ✅ |
| Crew credentialing & tracking | ✅ | ❌ | ✅ |
| Travel booking | ❌ | ✅ | ✅ (V1 manual → C Teleport) |
| Crew change workflow | ❌ | ❌ | ✅ |
| Cost event tracking / refund chain | ❌ | Partial | ✅ |
| Change Portal (Kelly's view) | ❌ | ❌ | ✅ |
| Ground logistics coordination | ❌ | ❌ | ✅ |
| Travel packet push (SMS/email) | ❌ | ❌ | ✅ |
| Visa request builder & tracker | ❌ | ❌ | ✅ |
| Gusto crew sync | ❌ | ❌ | ✅ (post-V1) |
| Hotel picker with policy controls | ❌ | ❌ | ✅ |
| **Unified ops + crew + finance** | ❌ | ❌ | ✅ |

---

## 6. Pricing — Blended Subscription + PNR Model

### Phase 1: Ops + Crew + Travel Platform
- **$1,880/month** subscription ($22,600/year) **+ $20/PNR** service fee
- Includes: Vessel ops, watch system, crew management, credentialing, crew change workflow, Change Portal, travel planning, ground logistics, travel packets, visa tracking, hotel picker, Gusto sync
- Hosting, maintenance, support, and minor enhancements included
- Estimated ~200 PNRs/yr for SANSU (3 vessels) → **~$26,600/yr total**

### Phase 2: + Engineering Module
- **$3,000/month** subscription ($36,000/year) **+ $20/PNR** service fee
- Adds: Engineering logs, planned maintenance system, parts inventory, regulatory compliance tracking
- All Phase 1 features + ongoing development included
- Estimated at same volume → **~$40,000/yr total**

### PNR Service Fee — What $20/PNR Covers
| What D-A Charges $10/PNR For | What Our $20/PNR Covers |
|------|------|
| Basic booking pass-through | C Teleport marine fare sourcing |
| — | Lifeline AI auto-rebooking (4 AM incidents, zero humans) |
| — | Full cost event tracking (every change/cancel/refund → crew + voyage) |
| — | Travel packet generation + push (SMS/email, token-based portal) |
| — | Ground logistics coordination (pickup sequencing, hotel routing) |

### 5-Year Comparison

| Solution | Annual | 5-Year Total |
|----------|--------|--------------|
| **HELM + D-A/Atriis** | $45,200 | **$226,000** |
| **Ops Normal (Phase 1 + PNR)** | ~$26,600 | **~$133,000** |
| | **Savings:** | **~$93,000 (41%)** |

### Why This Wins

**41% cheaper on day one. Ten times the product. You own the data.**

- **$93,000 cheaper** over 5 years than HELM + D-A combined
- **41% savings** from the first invoice — not a break-even-in-year-3 story
- **Unified system** — not two disconnected tools duct-taped together
- D-A’s $25k quote is stripped-down (no Duty of Care, no virtual cards, no reporting — those push it to $54k/yr)
- HELM serves 200+ vessels with one-size-fits-all; this is built for how SANSU actually operates
- **$1,880/mo is less than what D-A charges just for travel** — and they can’t rebook your crew at 4 AM
- **Data portability** — Supabase-backed, full SQL export anytime. Walk away from HELM and you leave with nothing.
- Includes capabilities neither vendor offers at any price: crew change workflow, Change Portal, travel packets, visa builder, ground logistics, hotel picker, Lifeline AI, Gusto crew sync

### Post-V1 Integrations (Included in Subscription)
- C Teleport API (travel booking automation) — ~28 hours to wire
- Gusto crew sync — ~20 hours to wire
- No additional cost to Standing Tide

---

## 7. White-Label Revenue Model

Standing Tide (Eric Bardot) has a crew management contract with Lindblad Expeditions (~6 expedition ships, crews of 100–150). Once SANSU is proven, Standing Tide can offer the platform as a white-label solution to Lindblad.

### Wholesale Pricing to Standing Tide
| Item | Wholesale Rate | Notes |
|------|---------------|-------|
| Platform subscription | ~$1,200/mo/vessel | Standing Tide marks up at their discretion |
| PNR service fee | $15/PNR | Standing Tide marks up to Lindblad (e.g., $25–35/PNR) |

### Lindblad Estimated Volume
- ~6 vessels, ~125 crew each, rotations every 2–4 weeks
- Estimated 2,000–4,000+ PNRs/yr
- Platform revenue: ~$86,400/yr (6 vessels × $1,200/mo × 12)
- PNR revenue: $30,000–60,000/yr (at $15 wholesale)
- **Total Lindblad account: ~$116k–146k/yr to Ops Normal**

### Revenue at Scale

| Customers | Subscription | PNR Fees | Total Annual |
|---|---|---|---|
| SANSU only | $22,600 | $4,000 | $26,600 |
| + 2 direct clients | $67,800 | $12,000 | $79,800 |
| + Lindblad (white-label) | $154,200 | $72,000 | $226,200 |
| 10 direct + Lindblad | $312,200 | $112,000 | $424,200 |

> Standing Tide becomes a channel partner, not just a customer. Their Lindblad contract becomes a distribution channel for the platform.

---

*Ops Normal AI LLC — Built for blue water, priced for reality.*
