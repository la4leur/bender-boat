import { Task, Milestone } from './types';

export const TOTAL_WEEKS = 30;

export const phaseInfo: Record<string, { label: string; color: string; bgColor: string; weeks: string; description: string }> = {
  v1: {
    label: 'V1 — Core Platform',
    color: 'text-success',
    bgColor: 'bg-success',
    weeks: 'Weeks 1–10',
    description: 'HELM replacement: vessel ops, crew management, crew change, travel (manual)'
  },
  'v1.5': {
    label: 'V1.5 — Advanced Logistics',
    color: 'text-warning',
    bgColor: 'bg-warning',
    weeks: 'Weeks 11–18',
    description: 'C Teleport integration, Lifeline, Change Portal, Travel Packets, Visa Tracker'
  },
  v2: {
    label: 'V2 — Engineering + Scale',
    color: 'text-info',
    bgColor: 'bg-info',
    weeks: 'Weeks 19–28',
    description: 'Maintenance management, white-label framework, Lindblad onboarding'
  }
};

export const tasks: Task[] = [
  // ═══════════════════════════════════════════
  // V1 — Core Platform (Weeks 1–10)
  // ═══════════════════════════════════════════

  // Week 1–2: Foundation
  {
    id: 'v1-auth',
    name: 'Auth + RBAC',
    phase: 'v1',
    startWeek: 1,
    endWeek: 2,
    category: 'Foundation',
    description: 'Supabase Auth, role-based access (master, mate, engineer, admin, finance), RLS policies',
    team: 'Jim + Cam',
    confidence: 9,
    referenceFrom: 'Ferry Log'
  },
  {
    id: 'v1-supabase',
    name: 'Supabase Deploy + Schema',
    phase: 'v1',
    startWeek: 1,
    endWeek: 2,
    category: 'Foundation',
    description: 'Deploy Supabase project, apply full schema (vessels, crew, voyages, watches, credentials, travel)',
    team: 'Jim',
    confidence: 9
  },
  {
    id: 'v1-vessel',
    name: 'Vessel Profile',
    phase: 'v1',
    startWeek: 1,
    endWeek: 2,
    category: 'Foundation',
    description: 'Vessel dashboard — name, class, flag, IMO, official number, specs, current status',
    team: 'Cam',
    confidence: 9,
    referenceFrom: 'Ferry Log'
  },

  // Week 2–4: Crew + Watch
  {
    id: 'v1-crew-crud',
    name: 'Crew CRUD + Roster',
    phase: 'v1',
    startWeek: 2,
    endWeek: 4,
    category: 'Crew',
    description: 'Crew profiles, department assignments, position roster, status tracking (aboard/relief pool/shore)',
    dependencies: ['v1-auth', 'v1-supabase'],
    team: 'Cam',
    confidence: 9
  },
  {
    id: 'v1-watch',
    name: 'Watch System',
    phase: 'v1',
    startWeek: 3,
    endWeek: 5,
    category: 'Operations',
    description: '4-on/8-off rotation, watch log entries, offgoing officer sign-off, STCW rest compliance',
    dependencies: ['v1-crew-crud'],
    team: 'Jim',
    confidence: 8,
    referenceFrom: 'Ferry Log'
  },

  // Week 4–6: Credentials + Nav
  {
    id: 'v1-credentials',
    name: 'Credential Management',
    phase: 'v1',
    startWeek: 4,
    endWeek: 6,
    category: 'Crew',
    description: 'Licenses, certifications, D&A compliance tracking, expiry alerts, USCG audit dashboard',
    dependencies: ['v1-crew-crud'],
    team: 'Cam',
    confidence: 8
  },
  {
    id: 'v1-nav-log',
    name: 'Nav Log',
    phase: 'v1',
    startWeek: 4,
    endWeek: 5,
    category: 'Operations',
    description: 'Waypoint entry, position logging, weather observations, course/speed records',
    dependencies: ['v1-watch'],
    team: 'Jim',
    confidence: 8,
    referenceFrom: 'Ferry Log (partial)'
  },

  // Week 5–7: Voyage + Ship's Rounds
  {
    id: 'v1-voyage',
    name: 'Voyage Planning',
    phase: 'v1',
    startWeek: 5,
    endWeek: 7,
    category: 'Operations',
    description: 'Voyage creation, waypoints, ETA tracking, port calls, sea time calculation',
    dependencies: ['v1-nav-log'],
    team: 'Jim',
    confidence: 7
  },
  {
    id: 'v1-rounds',
    name: "Ship's Rounds + Wakeups",
    phase: 'v1',
    startWeek: 6,
    endWeek: 7,
    category: 'Operations',
    description: 'Checklist-based rounds, next-watch wakeup verification, inspection logging',
    dependencies: ['v1-watch'],
    team: 'Cam',
    confidence: 8
  },

  // Week 7–9: Crew Change + Travel
  {
    id: 'v1-crew-change',
    name: 'Crew Change Workflow',
    phase: 'v1',
    startWeek: 7,
    endWeek: 9,
    category: 'Travel',
    description: 'Schedule crew changes, relief assignments, travel request creation, status tracking',
    dependencies: ['v1-crew-crud', 'v1-voyage'],
    team: 'Cam',
    confidence: 7
  },
  {
    id: 'v1-travel-manual',
    name: 'Travel Management (Manual)',
    phase: 'v1',
    startWeek: 7,
    endWeek: 9,
    category: 'Travel',
    description: 'Manual flight entry, itinerary tracking, cost recording, booking status',
    dependencies: ['v1-crew-change'],
    team: 'Jim',
    confidence: 8
  },

  // Week 9–10: Polish + Deploy
  {
    id: 'v1-dashboards',
    name: 'Dashboards + Reports',
    phase: 'v1',
    startWeek: 9,
    endWeek: 10,
    category: 'Foundation',
    description: 'Vessel summary, compliance overview, crew status, credential expiry report',
    dependencies: ['v1-credentials', 'v1-watch', 'v1-voyage'],
    team: 'Cam',
    confidence: 8
  },
  {
    id: 'v1-deploy',
    name: 'Testing + Deploy',
    phase: 'v1',
    startWeek: 9,
    endWeek: 10,
    category: 'Foundation',
    description: 'Integration testing, UAT with Eric, deploy to production (cPanel), onboarding walkthrough',
    dependencies: ['v1-dashboards'],
    team: 'Jim + Cam',
    confidence: 8,
    milestone: true,
    milestoneLabel: 'V1 Launch'
  },

  // ═══════════════════════════════════════════
  // V1.5 — Advanced Logistics (Weeks 11–18)
  // ═══════════════════════════════════════════

  {
    id: 'v15-lifeline',
    name: 'Lifeline Portal',
    phase: 'v1.5',
    startWeek: 11,
    endWeek: 13,
    category: 'Travel',
    description: 'Crew emergency travel portal (token-based), reason codes, GPS location, incident creation',
    dependencies: ['v1-deploy'],
    team: 'Cam',
    confidence: 8
  },
  {
    id: 'v15-guardrails',
    name: 'AI Guardrails',
    phase: 'v1.5',
    startWeek: 12,
    endWeek: 14,
    category: 'Travel',
    description: 'Three-tier auto-authorize (Green/Yellow/Red), configurable thresholds, pattern detection, morning digest',
    dependencies: ['v15-lifeline'],
    team: 'Jim',
    confidence: 7
  },
  {
    id: 'v15-change-portal',
    name: 'Change Portal',
    phase: 'v1.5',
    startWeek: 11,
    endWeek: 13,
    category: 'Finance',
    description: "Kelly's expense dashboard — cost events, refund tracking, attribution by crew/voyage, CSV export",
    dependencies: ['v1-deploy'],
    team: 'Cam',
    confidence: 8
  },
  {
    id: 'v15-cteleport',
    name: 'C Teleport Integration',
    phase: 'v1.5',
    startWeek: 13,
    endWeek: 16,
    category: 'Travel',
    description: '6 API endpoints: upload passengers, travel requests, sync flights, pull bookings, crew changes, delete requests',
    dependencies: ['v1-travel-manual'],
    team: 'Jim',
    confidence: 6
  },
  {
    id: 'v15-oah-sms',
    name: 'Office@Hand SMS Integration',
    phase: 'v1.5',
    startWeek: 13,
    endWeek: 14,
    category: 'Comms',
    description: 'SMS push for travel packets, watch alerts, Lifeline notifications via Standing Tide O@H plan',
    dependencies: ['v1-deploy'],
    team: 'Jim',
    confidence: 7
  },
  {
    id: 'v15-travel-packets',
    name: 'Travel Packets',
    phase: 'v1.5',
    startWeek: 14,
    endWeek: 16,
    category: 'Travel',
    description: 'Per-crew packet generation, SMS/email push, group push, token-based portal, change highlighting',
    dependencies: ['v15-oah-sms', 'v15-cteleport'],
    team: 'Cam',
    confidence: 7
  },
  {
    id: 'v15-ground-logistics',
    name: 'Ground Logistics + Hotels',
    phase: 'v1.5',
    startWeek: 15,
    endWeek: 16,
    category: 'Travel',
    description: 'Pickup sequencing, hotel picker (reimbursable/non-, distance, corporate rates, amenities), routing groups',
    dependencies: ['v15-cteleport'],
    team: 'Cam',
    confidence: 7
  },
  {
    id: 'v15-visa',
    name: 'Visa Tracker + Builder',
    phase: 'v1.5',
    startWeek: 15,
    endWeek: 17,
    category: 'Crew',
    description: 'Destination requirements, status pipeline, lead time alerts, expiry tracking, port agent contacts',
    dependencies: ['v1-credentials'],
    team: 'Jim',
    confidence: 7
  },
  {
    id: 'v15-test',
    name: 'V1.5 Integration Testing',
    phase: 'v1.5',
    startWeek: 17,
    endWeek: 18,
    category: 'Foundation',
    description: 'End-to-end travel flow testing, C Teleport UAT, Lifeline scenario testing, deploy',
    dependencies: ['v15-guardrails', 'v15-travel-packets', 'v15-ground-logistics', 'v15-visa'],
    team: 'Jim + Cam',
    confidence: 7,
    milestone: true,
    milestoneLabel: 'V1.5 Launch'
  },

  // ═══════════════════════════════════════════
  // V2 — Engineering + White-Label (Weeks 19–28)
  // ═══════════════════════════════════════════

  {
    id: 'v2-equipment',
    name: 'Equipment Registry',
    phase: 'v2',
    startWeek: 19,
    endWeek: 21,
    category: 'Engineering',
    description: 'Equipment database, hierarchies (system → component → part), specs, manufacturer data, photos',
    dependencies: ['v15-test'],
    team: 'Cam',
    confidence: 6
  },
  {
    id: 'v2-pms',
    name: 'Planned Maintenance System',
    phase: 'v2',
    startWeek: 20,
    endWeek: 23,
    category: 'Engineering',
    description: 'Scheduled maintenance tasks, calendar/running-hour triggers, recurrence rules, checklist templates',
    dependencies: ['v2-equipment'],
    team: 'Jim',
    confidence: 5
  },
  {
    id: 'v2-work-orders',
    name: 'Work Orders',
    phase: 'v2',
    startWeek: 22,
    endWeek: 24,
    category: 'Engineering',
    description: 'Create, assign, track work orders. Priority levels, parts required, labor hours, completion sign-off',
    dependencies: ['v2-pms'],
    team: 'Cam',
    confidence: 6
  },
  {
    id: 'v2-running-hours',
    name: 'Running Hour Tracking',
    phase: 'v2',
    startWeek: 21,
    endWeek: 23,
    category: 'Engineering',
    description: 'Engine/generator hour logging, automatic maintenance triggers, trend analysis',
    dependencies: ['v2-equipment'],
    team: 'Jim',
    confidence: 6
  },
  {
    id: 'v2-parts',
    name: 'Parts Inventory',
    phase: 'v2',
    startWeek: 23,
    endWeek: 25,
    category: 'Engineering',
    description: 'Spare parts tracking, minimum stock alerts, cross-reference to equipment and work orders',
    dependencies: ['v2-work-orders'],
    team: 'Cam',
    confidence: 6
  },
  {
    id: 'v2-white-label',
    name: 'White-Label Framework',
    phase: 'v2',
    startWeek: 24,
    endWeek: 26,
    category: 'Platform',
    description: 'Multi-tenant architecture, branding config, tenant isolation, Standing Tide admin portal',
    dependencies: ['v15-test'],
    team: 'Jim',
    confidence: 5
  },
  {
    id: 'v2-gusto',
    name: 'Gusto Payroll Sync',
    phase: 'v2',
    startWeek: 25,
    endWeek: 26,
    category: 'Platform',
    description: 'Crew profile sync from Gusto, no double-entry, sea time → payroll export',
    dependencies: ['v1-crew-crud'],
    team: 'Jim',
    confidence: 7
  },
  {
    id: 'v2-lindblad',
    name: 'Lindblad Onboarding',
    phase: 'v2',
    startWeek: 26,
    endWeek: 28,
    category: 'Platform',
    description: 'Standing Tide white-label instance for Lindblad Expeditions, fleet setup (~6 vessels), crew import',
    dependencies: ['v2-white-label'],
    team: 'Jim + Cam',
    confidence: 5
  },
  {
    id: 'v2-class-society',
    name: 'Class Society Reporting',
    phase: 'v2',
    startWeek: 26,
    endWeek: 27,
    category: 'Engineering',
    description: 'Maintenance reports formatted for ABS/DNV/Lloyds, survey prep checklists, deficiency tracking',
    dependencies: ['v2-pms', 'v2-work-orders'],
    team: 'Cam',
    confidence: 5
  },
  {
    id: 'v2-deploy',
    name: 'V2 Testing + Launch',
    phase: 'v2',
    startWeek: 27,
    endWeek: 28,
    category: 'Foundation',
    description: 'Full platform testing, Lindblad pilot, engineering module UAT, production deploy',
    dependencies: ['v2-lindblad', 'v2-class-society', 'v2-parts'],
    team: 'Jim + Cam',
    confidence: 5,
    milestone: true,
    milestoneLabel: 'V2 Launch'
  }
];

export const milestones: Milestone[] = [
  { id: 'm-v1', label: 'V1 Launch — HELM Replaced', week: 10, phase: 'v1' },
  { id: 'm-cteleport', label: 'C Teleport Live — D-A Replaced', week: 16, phase: 'v1.5' },
  { id: 'm-v15', label: 'V1.5 Launch — Full Logistics', week: 18, phase: 'v1.5' },
  { id: 'm-eng', label: 'Engineering Modules Complete', week: 25, phase: 'v2' },
  { id: 'm-v2', label: 'V2 Launch — White-Label + Lindblad', week: 28, phase: 'v2' }
];
