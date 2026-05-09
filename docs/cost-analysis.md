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
| HELM (vessel ops) | $20,000 | $100,000 |
| D-A / Atriis (travel) | $25,200 | $126,000 |
| **Current Total** | **$45,200** | **$226,000** |

*And they still have the "mystery refund" problem. No unified system. No crew change workflow. No visa tracking.*

### Our Solution — Subscription Model
| Phase | Monthly | Annual | 5-Year |
|-------|---------|--------|--------|
| Phase 1: Ops + Crew + Travel | $2,500 | $30,000 | $30,000 (Year 1) |
| Phase 2: + Engineering | $4,000 | $48,000 | $192,000 (Years 2–5) |
| **Total** | | | **$222,000** |

### Side-by-Side
| | HELM + D-A | Ops Normal AI |
|---|---|---|
| 5-Year Cost | $226,000 | $222,000 |
| Unified System | ❌ | ✅ |
| Crew Change Workflow | ❌ | ✅ |
| Change Portal (Finance) | ❌ | ✅ |
| Travel Packets & Visa Tracking | ❌ | ✅ |
| Ground Logistics & Hotel Picker | ❌ | ✅ |
| Gusto Crew Sync | ❌ | ✅ |
| Data Portability | ❌ | ✅ |
| Tailored to SANSU Ops | ❌ | ✅ |

> **$4,000 less over 5 years. Infinitely more product. Full data ownership.**

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

## 6. Pricing — Subscription Model

### Phase 1: Ops + Crew + Travel Platform
- **$2,500/month** ($30,000/year)
- Includes: Vessel ops, watch system, crew management, credentialing, crew change workflow, Change Portal, travel planning, ground logistics, travel packets, visa tracking, hotel picker, Gusto sync
- Hosting, maintenance, support, and minor enhancements included

### Phase 2: + Engineering Module
- **$4,000/month** ($48,000/year)
- Adds: Engineering logs, planned maintenance system, parts inventory, regulatory compliance tracking
- All Phase 1 features + ongoing development included

### 5-Year Comparison

| Solution | Year 1 | Years 2–5 | 5-Year Total |
|----------|--------|-----------|--------------|
| **Ops Normal (P1 → P2)** | $30,000 | $192,000 | **$222,000** |
| **HELM + D-A/Atriis** | $45,200 | $180,800 | **$226,000** |
| | | **Savings:** | **$4,000** |

### Why This Wins

**Same money. Ten times the product. You own the data.**

- **$4,000 cheaper** over 5 years than HELM + D-A combined
- **Unified system** — not two disconnected tools duct-taped together
- D-A's $25k quote is stripped-down (no Duty of Care, no virtual cards, no reporting — those push it to $54k/yr)
- HELM serves 200+ vessels with one-size-fits-all; this is built for how SANSU actually operates
- **Data portability** — Supabase-backed, full SQL export anytime. Walk away from HELM and you leave with nothing.
- Includes capabilities neither vendor offers at any price: crew change workflow, Change Portal, travel packets, visa builder, ground logistics, hotel picker, Gusto crew sync

### Post-V1 Integrations (Included in Subscription)
- C Teleport API (travel booking automation) — ~28 hours to wire
- Gusto crew sync — ~20 hours to wire
- No additional cost to Standing Tide

---

*Ops Normal AI LLC — Built for blue water, priced for reality.*
