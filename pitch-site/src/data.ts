export const requirements = [
  { id: 'sched', label: 'Crew Scheduling & Double-Book Prevention', met: true, exceeded: true, pillar: 2 },
  { id: 'cred', label: 'Credential Compliance & Expiry Tracking', met: true, exceeded: true, pillar: 3 },
  { id: 'sea', label: 'Sea Time Records & Letters', met: true, exceeded: false, pillar: 4 },
  { id: 'drug', label: 'Drug & Alcohol Testing Management', met: true, exceeded: false, pillar: 3 },
  { id: 'travel', label: 'Crew Travel Tracking & Booking', met: true, exceeded: true, pillar: 2 },
  { id: 'deck', label: 'Deck & Engineering Log Books', met: true, exceeded: true, pillar: 4 },
  { id: 'fatigue', label: 'Work Hours / Fatigue Compliance', met: true, exceeded: true, pillar: 4 },
  { id: 'maint', label: 'Maintenance Tracking (V2)', met: true, exceeded: false, pillar: 1 },
];

export interface FlowNode {
  title: string;
  desc: string;
  data: string[];
  color: string; // tailwind color class
}

export interface PillarData {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  summary: string;
  keyBenefits: string[];
  flow: FlowNode[];
  reqIds: string[];
}

export const pillars: PillarData[] = [
  {
    id: 1,
    title: 'Vessel Operations',
    subtitle: 'Voyage Management & Configuration',
    icon: '⚓',
    color: 'sea',
    gradientFrom: 'from-sea-500',
    gradientTo: 'to-sea-700',
    summary: 'Config-driven vessel management that adapts to each vessel\'s operational profile — watch patterns, department structures, and engineering templates without code changes.',
    keyBenefits: [
      'Each vessel configured independently — different watch patterns, engine configurations, department structures',
      'Voyage lifecycle management from departure to arrival across multi-day passages',
      'Config-driven architecture: change vessel behavior by updating settings, not code',
      'Foundation layer — every other pillar references vessel and voyage context',
    ],
    flow: [
      { title: 'Vessel Profile', desc: 'Each Bender Class vessel configured with its operational profile', data: ['Watch pattern (4-on/8-off, 6-on/6-off)', 'Department structure (Deck, Engine, Steward)', 'Engineering plant specifics', 'Safety equipment inventory'], color: 'sea' },
      { title: 'Voyage Created', desc: 'Passage planned from port to port with waypoints', data: ['Departure / arrival ports & ETAs', 'Waypoint list with distances', 'Crew manifest for this voyage', 'Voyage classification (coastal / ocean)'], color: 'sea' },
      { title: 'Underway', desc: 'Voyage is active — all logging systems engaged', data: ['Watch rotation auto-activated', 'Nav log entries (position, course, speed, weather)', 'Engineering & ship\'s rounds on schedule', 'Work hours tracking live'], color: 'sea' },
      { title: 'Voyage Closed', desc: 'Arrival confirmed — records sealed', data: ['Immutable voyage record', 'Sea time automatically calculated', 'All log entries finalized', 'PDF export available'], color: 'sea' },
    ],
    reqIds: ['maint'],
  },
  {
    id: 2,
    title: 'Crew Management',
    subtitle: 'Scheduling, Assignments & Travel',
    icon: '👥',
    color: 'gold',
    gradientFrom: 'from-gold-500',
    gradientTo: 'to-gold-700',
    summary: 'Complete crew lifecycle management — from onboarding through scheduling, travel, and sea-time tracking. Database-level constraints prevent double-booking before it happens.',
    keyBenefits: [
      'Double-booking prevention enforced at the database level — not just a UI warning',
      'Automatic conflict detection across all three vessels when creating assignments',
      'Travel tracking integrated with assignments (manual V1, automated V2 via C Teleport)',
      'Position-based requirements: can\'t assign someone to a role they\'re not qualified for',
    ],
    flow: [
      { title: 'Crew Onboarding', desc: 'New crew member added to the system', data: ['Personal info & emergency contacts', 'Home airport (for travel)', 'Position qualifications', 'Credential matrix populated'], color: 'gold' },
      { title: 'Assignment Created', desc: 'Crew member assigned to vessel + position + dates', data: ['Vessel, position, start/end dates', 'DB constraint checks double-booking', 'Credential compliance verified', 'Travel status: "Needs Booking"'], color: 'gold' },
      { title: 'Travel Arranged', desc: 'Transport to/from vessel coordinated', data: ['Flights booked (manual or via C Teleport API)', 'Hotel if needed', 'Ground transport', 'Real-time travel status updates'], color: 'gold' },
      { title: 'On Board', desc: 'Crew member active on vessel — fully tracked', data: ['Watch schedule assigned', 'Work hours accumulating', 'Sea time recording', 'Available for rounds & duties'], color: 'gold' },
    ],
    reqIds: ['sched', 'travel'],
  },
  {
    id: 3,
    title: 'Credential Compliance',
    subtitle: 'Certifications, Drug Testing & Regulatory',
    icon: '🛡️',
    color: 'sea',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-cyan-700',
    summary: 'Every position has a credential matrix defining what\'s required. The system continuously validates compliance and alerts before anything expires — no surprises during an audit.',
    keyBenefits: [
      'Position-based credential matrix — each role defines exactly what certifications are required',
      'Automatic expiry monitoring with configurable alert windows (90/60/30 days)',
      'Drug & alcohol test tracking with random selection pool management',
      'Audit-ready: one-click compliance report for any crew member or vessel',
    ],
    flow: [
      { title: 'Credential Matrix', desc: 'Each position defines its requirements', data: ['MMC, STCW, TWIC per position', 'Medical certificate requirements', 'Vessel-specific endorsements', 'Custom credentials per role'], color: 'teal' },
      { title: 'Crew Credentials', desc: 'Each crew member\'s actual documents tracked', data: ['Document number & issuing authority', 'Issue date, expiry date', 'Verification status', 'Digital copy attached'], color: 'teal' },
      { title: 'Compliance Engine', desc: 'Continuous automated checking', data: ['Assignment blocked if credentials missing', '90/60/30-day expiry warnings', 'Gap analysis per crew member', 'Fleet-wide compliance dashboard'], color: 'teal' },
      { title: 'Drug & Alcohol', desc: 'Full testing program management', data: ['Random selection pool', 'Test scheduling & tracking', 'Result recording (pass/fail/pending)', 'DOT/USCG compliance reporting'], color: 'teal' },
    ],
    reqIds: ['cred', 'drug'],
  },
  {
    id: 4,
    title: 'Logging & Watchkeeping',
    subtitle: 'Watch Logs, Engineering, Ship\'s Rounds & Nav',
    icon: '📋',
    color: 'gold',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-700',
    summary: 'Unified digital logging that replaces paper. Watch entries feed work-hour calculations automatically. Only the offgoing watch officer signs the log — maintaining proper chain of accountability.',
    keyBenefits: [
      'Offgoing watch officer signs the log — proper chain of accountability',
      'Work hours calculated automatically from watch entries — no separate timekeeping',
      'Engineering rounds with vessel-specific checklist templates',
      'Ship\'s rounds include next-watch wakeup tracking with acknowledgment',
      'Sea time records generated automatically at voyage close',
    ],
    flow: [
      { title: 'Watch Begins', desc: 'Officer assumes the watch and starts logging', data: ['Weather & sea state', 'Vessel position, course, speed', 'Crew on watch identified', 'Any orders from previous watch'], color: 'amber' },
      { title: 'During Watch', desc: 'Continuous operational logging', data: ['Nav log entries (periodic positions)', 'Engineering round checklists', 'Ship\'s rounds + wakeup tracking', 'Incident / event entries as needed'], color: 'amber' },
      { title: 'Watch Ends', desc: 'Offgoing officer signs and hands off', data: ['Offgoing officer digital signature', 'Work hours auto-calculated', 'Fatigue compliance checked (rolling 24h/7d)', 'Standing orders for next watch'], color: 'amber' },
      { title: 'Records Sealed', desc: 'Voyage complete — immutable records', data: ['Sea time letters auto-generated', 'Full voyage log PDF export', 'Work hour summaries per crew', 'Regulatory-ready documentation'], color: 'amber' },
    ],
    reqIds: ['sea', 'deck', 'fatigue'],
  },
];

export interface ComparisonRow {
  feature: string;
  helm: string;
  helmStatus: 'yes' | 'no' | 'partial';
  bender: string;
  benderStatus: 'yes' | 'exceeds';
}

export const comparison: ComparisonRow[] = [
  { feature: 'Crew Scheduling', helm: 'Basic calendar', helmStatus: 'yes', bender: 'DB-enforced double-booking prevention + conflict detection', benderStatus: 'exceeds' },
  { feature: 'Credential Tracking', helm: 'Document storage', helmStatus: 'yes', bender: 'Position-based matrix + auto-compliance + expiry alerts', benderStatus: 'exceeds' },
  { feature: 'Drug Testing', helm: 'Not included', helmStatus: 'no', bender: 'Full program: random pool, scheduling, results, DOT reporting', benderStatus: 'exceeds' },
  { feature: 'Sea Time Records', helm: 'Manual entry', helmStatus: 'partial', bender: 'Auto-calculated from voyage data + letter generation', benderStatus: 'exceeds' },
  { feature: 'Travel Management', helm: 'D-A/Atriis ($25k/yr extra)', helmStatus: 'partial', bender: 'Built-in + C Teleport API (V2)', benderStatus: 'exceeds' },
  { feature: 'Crew Change Workflow', helm: 'Not in HELM or D-A', helmStatus: 'no', bender: 'Full lifecycle: book → delay → rebook → cancel → replace', benderStatus: 'exceeds' },
  { feature: 'Expense / Refund Tracking', helm: 'Not in either tool', helmStatus: 'no', bender: 'Change Portal: every cost event chained to crew + voyage', benderStatus: 'exceeds' },
  { feature: 'Travel Packets & Visa Tracking', helm: 'Not available', helmStatus: 'no', bender: 'SMS/email push, portal links, visa builder + expiry alerts', benderStatus: 'exceeds' },
  { feature: 'Ground Logistics & Hotels', helm: 'Not available', helmStatus: 'no', bender: 'Pickup sequence, hotel picker, reimbursement policy controls', benderStatus: 'exceeds' },
  { feature: 'Digital Log Books', helm: 'Basic forms (HELM)', helmStatus: 'partial', bender: 'Full watch system: nav log, engineering, ship\'s rounds, signatures', benderStatus: 'exceeds' },
  { feature: 'Work Hours / Fatigue', helm: 'Manual timesheets (HELM)', helmStatus: 'partial', bender: 'Auto-calculated from watches with rolling compliance checks', benderStatus: 'exceeds' },
  { feature: 'Gusto Crew Sync', helm: 'Not available', helmStatus: 'no', bender: 'Auto-sync crew profiles from payroll — no double entry', benderStatus: 'exceeds' },
  { feature: 'Data Ownership', helm: 'Vendor-hosted, vendor-owned', helmStatus: 'no', bender: 'Your Supabase instance — full SQL export anytime', benderStatus: 'exceeds' },
  { feature: 'Annual Cost (3 vessels)', helm: '~$45,200/year (combined)', helmStatus: 'partial', bender: '$30,000/year (Phase 1)', benderStatus: 'exceeds' },
  { feature: 'Unified System', helm: 'Two separate logins, no data sharing', helmStatus: 'no', bender: 'One platform — ops, crew, travel, finance', benderStatus: 'exceeds' },
];

export interface BuildPhase {
  phase: number;
  title: string;
  weeks: string;
  deliverables: string[];
  highlight?: string;
}

export const buildPhases: BuildPhase[] = [
  {
    phase: 1,
    title: 'Foundation',
    weeks: 'Weeks 1–3',
    deliverables: [
      'Supabase schema deployed',
      'Vessel profiles & configuration',
      'Crew member management',
      'Credential matrix & compliance engine',
      'Double-booking prevention',
    ],
    highlight: 'Core data model — everything builds on this',
  },
  {
    phase: 2,
    title: 'Logging System',
    weeks: 'Weeks 4–6',
    deliverables: [
      'Watch entry system with signatures',
      'Engineering round checklists',
      'Ship\'s rounds + wakeup tracking',
      'Navigation log',
      'Automatic work-hour calculation',
    ],
    highlight: 'The daily operational tools your officers use every watch',
  },
  {
    phase: 3,
    title: 'Operations',
    weeks: 'Weeks 7–9',
    deliverables: [
      'Sea time auto-calculation & letters',
      'Drug testing program management',
      'Crew travel tracking (manual)',
      'PDF report generation',
      'Dashboard & fleet overview',
    ],
    highlight: 'Office management tools — compliance, reporting, oversight',
  },
  {
    phase: 4,
    title: 'Polish & Launch',
    weeks: 'Week 10',
    deliverables: [
      'Mobile-optimized watch entry',
      'Onboarding wizard',
      'Documentation & training',
      'QA & bug fixes',
      'Production deployment',
    ],
    highlight: 'Ship it',
  },
];

export const travelIntegration = {
  platform: 'C Teleport',
  devHours: 28,
  features: [
    'Automated flight booking when crew assignments are created',
    'Marine/seaman fare access (discounted airline tickets)',
    'Booking confirmations sync back to Bender Boat dashboard',
    'Real-time flight status tracking per crew member',
    'Change management — voyage delays auto-trigger rebooking',
    'Cost tracking per vessel/voyage',
  ],
  apiEndpoints: [
    { name: 'Upload Passengers', desc: 'Push crew profiles → C Teleport', direction: 'outbound' },
    { name: 'Upload Crew Changes', desc: 'Assignment triggers travel request', direction: 'outbound' },
    { name: 'Pull Bookings', desc: 'Retrieve confirmed flights', direction: 'inbound' },
    { name: 'Sync Flights (Webhook)', desc: 'Live booking updates pushed to us', direction: 'inbound' },
  ],
};
