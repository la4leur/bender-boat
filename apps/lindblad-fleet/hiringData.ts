// Hiring & Onboarding Pipeline Data
// Based on real Lindblad/Standing Tide emails (lucasy@expeditions.com, Sam, Kelly)
// Documented process failures, tool fragmentation, and pipeline stages

export type PipelineStageId =
  | 'billet_open' | 'req_created' | 'posted' | 'screening' | 'interview'
  | 'offer_extended' | 'offer_accepted'
  | 'background_check' | 'drug_screen' | 'personal_info' | 'credential_upload'
  | 'credential_verify' | 'uniform_order' | 'hris_enrollment' | 'training'
  | 'travel_booked' | 'compliance_gate' | 'embark_ready';

export type StagePhase = 'hiring' | 'onboarding' | 'compliance';

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  shortName: string;
  phase: StagePhase;
  currentTool: string; // What Lindblad uses today
  ourReplacement: string; // What our platform does
  avgDays: number;
  order: number;
}

export type CandidateStatus = 'active' | 'blocked' | 'cleared' | 'rescinded' | 'withdrawn';

export interface OnboardingCheckItem {
  id: string;
  task: string;
  tool: string; // current tool used
  required: boolean;
  completed: boolean;
  blockedReason?: string;
  completedDate?: string;
  dueDate?: string;
}

export interface PipelineCandidate {
  id: string;
  name: string;
  targetPosition: string;
  targetVessel: string;
  currentStage: PipelineStageId;
  status: CandidateStatus;
  daysInPipeline: number;
  daysInCurrentStage: number;
  source: 'external' | 'loi' | 'rehire';
  blockers: string[];
  checklistItems: OnboardingCheckItem[];
  notes: string;
  entryDate: string;
  targetEmbarkDate: string | null;
  isRealExample: boolean; // from actual email data
}

export interface FragmentedTool {
  name: string;
  category: string;
  usedBy: string[];
  issues: string[];
  ourReplacement: string;
}

export interface ProcessFailure {
  id: string;
  title: string;
  person: string;
  date: string;
  description: string;
  impact: string;
  quote?: string;
  quoteBy?: string;
  toolsInvolved: string[];
  ourPrevention: string;
}

// ── Pipeline Stage Definitions ──

export const pipelineStages: PipelineStage[] = [
  { id: 'billet_open', name: 'Billet Opens', shortName: 'Open', phase: 'hiring', currentTool: 'Email / Verbal', ourReplacement: 'Auto-triggered from rotation schedule', avgDays: 0, order: 1 },
  { id: 'req_created', name: 'Requisition Created', shortName: 'Req', phase: 'hiring', currentTool: 'SharePoint spreadsheet', ourReplacement: 'One-click from billet view', avgDays: 2, order: 2 },
  { id: 'posted', name: 'Job Posted', shortName: 'Post', phase: 'hiring', currentTool: 'Lever + Indeed + LinkedIn', ourReplacement: 'ATS integration or built-in posting', avgDays: 3, order: 3 },
  { id: 'screening', name: 'Screening', shortName: 'Screen', phase: 'hiring', currentTool: 'Lever', ourReplacement: 'Pipeline board with cert pre-check', avgDays: 7, order: 4 },
  { id: 'interview', name: 'Interview', shortName: 'Int.', phase: 'hiring', currentTool: 'Lever + Email', ourReplacement: 'Scheduling + panel tracking', avgDays: 5, order: 5 },
  { id: 'offer_extended', name: 'Offer Extended', shortName: 'Offer', phase: 'hiring', currentTool: 'Lever', ourReplacement: 'Offer with auto-onboarding trigger', avgDays: 3, order: 6 },
  { id: 'offer_accepted', name: 'Offer Accepted', shortName: 'Accept', phase: 'hiring', currentTool: 'Lever → manual Smartsheet add', ourReplacement: 'Auto-generates full onboarding checklist', avgDays: 1, order: 7 },
  { id: 'background_check', name: 'Background Check', shortName: 'BG', phase: 'onboarding', currentTool: 'Sterling (email link)', ourReplacement: 'Status tracked in dashboard + auto-reminder', avgDays: 5, order: 8 },
  { id: 'drug_screen', name: 'Drug Screening', shortName: 'D&A', phase: 'onboarding', currentTool: 'LabCorp + Quest + DFB (3 logins)', ourReplacement: 'Unified D&A status — DFV tracks, we display', avgDays: 4, order: 9 },
  { id: 'personal_info', name: 'Personal Info', shortName: 'Info', phase: 'onboarding', currentTool: 'Smartsheet form', ourReplacement: 'Crew profile form + token portal', avgDays: 3, order: 10 },
  { id: 'credential_upload', name: 'Credential Upload', shortName: 'Creds', phase: 'onboarding', currentTool: 'Smartsheet form (wrong link sent)', ourReplacement: 'Position-specific upload checklist', avgDays: 5, order: 11 },
  { id: 'credential_verify', name: 'Credential Verify', shortName: 'Verify', phase: 'compliance', currentTool: 'Manual email review', ourReplacement: 'Auto-check against LEX compliance matrix', avgDays: 3, order: 12 },
  { id: 'uniform_order', name: 'Uniform Order', shortName: 'Unif.', phase: 'onboarding', currentTool: 'JotForm', ourReplacement: 'Onboarding step — one portal', avgDays: 2, order: 13 },
  { id: 'hris_enrollment', name: 'HRIS/Payroll Setup', shortName: 'HRIS', phase: 'onboarding', currentTool: 'Rippling (wait for email)', ourReplacement: 'Gusto sync or API enrollment', avgDays: 2, order: 14 },
  { id: 'training', name: 'Training Meeting', shortName: 'Train', phase: 'compliance', currentTool: 'Scheduled via email', ourReplacement: 'Auto-scheduled based on embark date', avgDays: 3, order: 15 },
  { id: 'travel_booked', name: 'Travel Booked', shortName: 'Travel', phase: 'onboarding', currentTool: 'Egencia (shared password)', ourReplacement: 'C Teleport — auto-book from crew change', avgDays: 5, order: 16 },
  { id: 'compliance_gate', name: 'Compliance Gate', shortName: 'GATE', phase: 'compliance', currentTool: 'Nobody checks — hope it works', ourReplacement: 'Auto-verified: no cert = no board = visible', avgDays: 0, order: 17 },
  { id: 'embark_ready', name: 'Embark Ready', shortName: '✅', phase: 'compliance', currentTool: 'Email from Sam', ourReplacement: 'Green light → crew change confirmed', avgDays: 0, order: 18 },
];

// ── Real + Realistic Candidates ──

export const candidates: PipelineCandidate[] = [
  // ── REAL: Sebastian Jean-Baptiste — falsified SAP, offer rescinded ──
  {
    id: 'sjb-001',
    name: 'Sebastian Jean-Baptiste',
    targetPosition: 'Rotational Deckhand',
    targetVessel: 'Quest',
    currentStage: 'offer_accepted',
    status: 'rescinded',
    daysInPipeline: 18,
    daysInCurrentStage: 10,
    source: 'external',
    blockers: ['SAP verification failed — falsified documents'],
    checklistItems: [
      { id: 'sjb-bg', task: 'Background Check', tool: 'Sterling', required: true, completed: true, completedDate: '2026-04-12' },
      { id: 'sjb-da', task: 'Drug Screening (SAP)', tool: 'SAP Counselor / Manual', required: true, completed: false, blockedReason: 'Falsified completion documents — counselor confirmed not completed' },
      { id: 'sjb-pi', task: 'Personal Info Form', tool: 'Smartsheet', required: true, completed: false },
      { id: 'sjb-cr', task: 'Credential Upload', tool: 'Smartsheet', required: true, completed: false },
    ],
    notes: 'OFFER RESCINDED. Altered SAP documents. 10 days lost. Reached out to Kayla, Sam, Rebecca — nobody knew status was blocked. Jenelle: "This is a serious process concern."',
    entryDate: '2026-04-01',
    targetEmbarkDate: '2026-04-25',
    isRealExample: true,
  },
  // ── REAL: Devon Tull — Chief Mate, Panama onboarding crisis ──
  {
    id: 'dt-001',
    name: 'Devon Tull',
    targetPosition: 'Chief Mate',
    targetVessel: 'Quest',
    currentStage: 'embark_ready',
    status: 'cleared',
    daysInPipeline: 28,
    daysInCurrentStage: 0,
    source: 'external',
    blockers: [],
    checklistItems: [
      { id: 'dt-bg', task: 'Background Check', tool: 'Sterling', required: true, completed: true, completedDate: '2025-10-05' },
      { id: 'dt-da', task: 'Drug Screening', tool: 'LabCorp', required: true, completed: true, completedDate: '2025-10-08' },
      { id: 'dt-pi', task: 'Personal Info Form', tool: 'Smartsheet', required: true, completed: true, completedDate: '2025-10-06' },
      { id: 'dt-cr', task: 'Credential Upload', tool: 'Smartsheet', required: true, completed: true, completedDate: '2025-10-14', blockedReason: 'Wrong Smartsheet link sent — passport not uploaded until Day -6' },
      { id: 'dt-cv', task: 'Credential Verification', tool: 'Email', required: true, completed: true, completedDate: '2025-10-16' },
      { id: 'dt-un', task: 'Uniform Order', tool: 'JotForm', required: true, completed: true, completedDate: '2025-10-10' },
      { id: 'dt-hr', task: 'Rippling Enrollment', tool: 'Rippling', required: true, completed: true, completedDate: '2025-10-12' },
      { id: 'dt-tr', task: 'Travel Booked', tool: 'Egencia', required: true, completed: true, completedDate: '2025-10-17' },
    ],
    notes: 'BARELY MADE IT. Wrong Smartsheet link sent. Passport missing 6 days before Panama embark. Customs docs submitted without Devon on manifest. Jim intervened personally.',
    entryDate: '2025-09-22',
    targetEmbarkDate: '2025-10-20',
    isRealExample: true,
  },
  // ── REAL: Bradley Wardle — Rotational Deckhand, onboarding in progress ──
  {
    id: 'bw-001',
    name: 'Bradley Wardle',
    targetPosition: 'Rotational Deckhand',
    targetVessel: 'Quest',
    currentStage: 'credential_upload',
    status: 'active',
    daysInPipeline: 14,
    daysInCurrentStage: 3,
    source: 'external',
    blockers: ['STCW VPDSD certificate not yet uploaded'],
    checklistItems: [
      { id: 'bw-bg', task: 'Background Check', tool: 'Sterling', required: true, completed: true, completedDate: '2025-11-18' },
      { id: 'bw-pi', task: 'Personal Info Form', tool: 'Smartsheet', required: true, completed: true, completedDate: '2025-11-16' },
      { id: 'bw-cr', task: 'Credential Upload (MMC)', tool: 'Smartsheet', required: true, completed: true, completedDate: '2025-11-19' },
      { id: 'bw-cr2', task: 'Credential Upload (TWIC)', tool: 'Smartsheet', required: true, completed: true, completedDate: '2025-11-19' },
      { id: 'bw-cr3', task: 'Credential Upload (STCW BST)', tool: 'Smartsheet', required: true, completed: true, completedDate: '2025-11-19' },
      { id: 'bw-cr4', task: 'Credential Upload (STCW VPDSD)', tool: 'Smartsheet', required: true, completed: false, dueDate: '2025-11-22' },
      { id: 'bw-cr5', task: 'Credential Upload (USCG Med Cert)', tool: 'Smartsheet', required: true, completed: false, dueDate: '2025-11-22' },
      { id: 'bw-da', task: 'Drug Screening', tool: 'LabCorp / Quest', required: true, completed: false, blockedReason: 'Kelly has separate login — Lucas can\'t verify status' },
      { id: 'bw-un', task: 'Uniform Order', tool: 'JotForm', required: true, completed: true, completedDate: '2025-11-17' },
      { id: 'bw-hr', task: 'Rippling Enrollment', tool: 'Rippling', required: false, completed: false },
      { id: 'bw-tr', task: 'Training Meeting', tool: 'Email', required: true, completed: false },
    ],
    notes: 'Sam sent 11-step onboarding checklist via email. Drug test status unknown — Kelly has separate LabCorp login. 185-day rule applies.',
    entryDate: '2025-11-11',
    targetEmbarkDate: '2025-11-25',
    isRealExample: true,
  },
  // ── REAL: Amanda Dow — employment record gap blocking MMC renewal ──
  {
    id: 'ad-001',
    name: 'Amanda Dow',
    targetPosition: 'Steward',
    targetVessel: 'Venture',
    currentStage: 'credential_verify',
    status: 'blocked',
    daysInPipeline: 45,
    daysInCurrentStage: 22,
    source: 'rehire',
    blockers: ['Cannot prove D&A pool enrollment Oct 31 – Dec 9, 2025', 'MMC renewal blocked by USCG'],
    checklistItems: [
      { id: 'ad-bg', task: 'Background Check', tool: 'Sterling', required: true, completed: true, completedDate: '2026-02-10' },
      { id: 'ad-da', task: 'Drug Screen Pool Verification', tool: 'LabCorp + Quest + DFB', required: true, completed: false, blockedReason: 'No proof of employment for Oct 31 – Dec 9. Sea time letter exists but no employment record. 3 portals, 2 months of emails.' },
      { id: 'ad-cr', task: 'MMC Renewal', tool: 'USCG', required: true, completed: false, blockedReason: 'Requires D&A pool proof for last 185 days — missing gap period' },
    ],
    notes: 'BLOCKED 2+ MONTHS. Employment records and drug test pool tracking in separate systems with no cross-reference. Lucas, Alicia, Stephen all involved — still unresolved.',
    entryDate: '2026-01-28',
    targetEmbarkDate: '2026-03-15',
    isRealExample: true,
  },
  // ── Realistic: New hire flowing smoothly through pipeline ──
  {
    id: 'mk-001',
    name: 'Marcus Kowalski',
    targetPosition: 'Engine Mechanic',
    targetVessel: 'Sea Bird',
    currentStage: 'compliance_gate',
    status: 'cleared',
    daysInPipeline: 21,
    daysInCurrentStage: 1,
    source: 'external',
    blockers: [],
    checklistItems: [
      { id: 'mk-bg', task: 'Background Check', tool: 'Sterling', required: true, completed: true, completedDate: '2026-05-02' },
      { id: 'mk-da', task: 'Drug Screening', tool: 'LabCorp', required: true, completed: true, completedDate: '2026-05-04' },
      { id: 'mk-pi', task: 'Personal Info Form', tool: 'Smartsheet', required: true, completed: true, completedDate: '2026-05-01' },
      { id: 'mk-cr', task: 'Credential Upload', tool: 'Smartsheet', required: true, completed: true, completedDate: '2026-05-03' },
      { id: 'mk-cv', task: 'Credential Verification', tool: 'Manual', required: true, completed: true, completedDate: '2026-05-06' },
      { id: 'mk-un', task: 'Uniform Order', tool: 'JotForm', required: true, completed: true, completedDate: '2026-05-02' },
      { id: 'mk-hr', task: 'HRIS Enrollment', tool: 'Rippling', required: true, completed: true, completedDate: '2026-05-05' },
      { id: 'mk-tm', task: 'Training Meeting', tool: 'Email', required: true, completed: true, completedDate: '2026-05-07' },
      { id: 'mk-tr', task: 'Travel Booked', tool: 'Egencia', required: true, completed: true, completedDate: '2026-05-08' },
    ],
    notes: 'Clean pipeline — all gates cleared in 21 days. This is what it looks like when nothing falls through the cracks.',
    entryDate: '2026-04-21',
    targetEmbarkDate: '2026-05-15',
    isRealExample: false,
  },
  // ── Realistic: LOI internal promotion — in interview ──
  {
    id: 'rh-001',
    name: 'Rachel Hernandez',
    targetPosition: '2nd Mate',
    targetVessel: 'Sea Lion',
    currentStage: 'interview',
    status: 'active',
    daysInPipeline: 12,
    daysInCurrentStage: 3,
    source: 'loi',
    blockers: [],
    checklistItems: [],
    notes: 'LOI submitted 4 months ago. Currently 3rd Mate on Sea Lion. Panel interview with Captain scheduled. Min quals verified: MMC 500 GRT Mate, ECDIS current.',
    entryDate: '2026-04-30',
    targetEmbarkDate: '2026-06-01',
    isRealExample: false,
  },
  // ── Realistic: Screening stage — multiple applicants ──
  {
    id: 'jt-001',
    name: 'Jason Torres',
    targetPosition: 'Sous Chef',
    targetVessel: 'Quest',
    currentStage: 'screening',
    status: 'active',
    daysInPipeline: 8,
    daysInCurrentStage: 5,
    source: 'external',
    blockers: [],
    checklistItems: [],
    notes: 'Applied via Indeed. Previous cruise line experience (NCL). Food handler cert current. Phone screen completed — moving to interview.',
    entryDate: '2026-05-04',
    targetEmbarkDate: '2026-06-15',
    isRealExample: false,
  },
  // ── Realistic: Background check in progress ──
  {
    id: 'lp-001',
    name: 'Lisa Park',
    targetPosition: 'Senior Steward',
    targetVessel: 'Venture',
    currentStage: 'background_check',
    status: 'active',
    daysInPipeline: 10,
    daysInCurrentStage: 4,
    source: 'external',
    blockers: ['Sterling check pending — 2 of 3 screens complete'],
    checklistItems: [
      { id: 'lp-bg', task: 'Background Check', tool: 'Sterling', required: true, completed: false, blockedReason: 'County court records check pending (2 of 3 screens done)' },
      { id: 'lp-pi', task: 'Personal Info Form', tool: 'Smartsheet', required: true, completed: true, completedDate: '2026-05-04' },
      { id: 'lp-cr', task: 'Credential Upload', tool: 'Smartsheet', required: true, completed: false },
      { id: 'lp-da', task: 'Drug Screening', tool: 'Quest', required: true, completed: false },
    ],
    notes: 'Offer accepted. Background check running. Personal info form already submitted — parallel processing.',
    entryDate: '2026-05-02',
    targetEmbarkDate: '2026-06-01',
    isRealExample: false,
  },
  // ── Realistic: Drug screen blocked — 185-day rule ──
  {
    id: 'tw-001',
    name: 'Tyler Washington',
    targetPosition: 'Rotational Deckhand',
    targetVessel: 'Sea Bird',
    currentStage: 'drug_screen',
    status: 'blocked',
    daysInPipeline: 15,
    daysInCurrentStage: 6,
    source: 'rehire',
    blockers: ['Last drug test was 190 days ago — new test required', 'LabCorp appointment not yet scheduled'],
    checklistItems: [
      { id: 'tw-bg', task: 'Background Check', tool: 'Sterling', required: true, completed: true, completedDate: '2026-05-01' },
      { id: 'tw-da', task: 'Drug Screening', tool: 'LabCorp', required: true, completed: false, blockedReason: 'Last test >185 days. Kelly must schedule but hasn\'t confirmed. Lucas can\'t see LabCorp status.' },
      { id: 'tw-pi', task: 'Personal Info Form', tool: 'Smartsheet', required: true, completed: true, completedDate: '2026-04-30' },
      { id: 'tw-cr', task: 'Credential Upload', tool: 'Smartsheet', required: true, completed: true, completedDate: '2026-05-02' },
    ],
    notes: 'Rehire from last season. Background clear, creds uploaded. Blocked on D&A — 185-day rule, separate login issue.',
    entryDate: '2026-04-27',
    targetEmbarkDate: '2026-05-20',
    isRealExample: false,
  },
  // ── Realistic: Billet just opened from resignation ──
  {
    id: 'open-001',
    name: '(Open Requisition)',
    targetPosition: 'Bartender',
    targetVessel: 'Quest',
    currentStage: 'posted',
    status: 'active',
    daysInPipeline: 5,
    daysInCurrentStage: 3,
    source: 'external',
    blockers: [],
    checklistItems: [],
    notes: 'Previous bartender resigned — billet opened 5/7. Posted on Lever + Indeed. 4 applications received. OLCC (Oregon Liquor Commission) cert required — state-specific.',
    entryDate: '2026-05-07',
    targetEmbarkDate: '2026-06-10',
    isRealExample: false,
  },
  // ── Realistic: Offer stage — waiting for response ──
  {
    id: 'cp-001',
    name: 'Carlos Peña',
    targetPosition: 'Asst. Engineer',
    targetVessel: 'Sea Lion',
    currentStage: 'offer_extended',
    status: 'active',
    daysInPipeline: 18,
    daysInCurrentStage: 2,
    source: 'external',
    blockers: ['Awaiting offer acceptance — sent 5/10'],
    checklistItems: [],
    notes: 'Strong candidate — 6 years OSG experience. Offer sent via Lever 5/10. If accepted, onboarding auto-generates checklist. QMMED endorsement verified.',
    entryDate: '2026-04-24',
    targetEmbarkDate: '2026-06-08',
    isRealExample: false,
  },
];

// ── Current Tool Fragmentation (Lindblad Reality) ──

export const fragmentedTools: FragmentedTool[] = [
  {
    name: 'Lever',
    category: 'Hiring',
    usedBy: ['Lucas Young', 'Kayla Ames'],
    issues: ['No connection to onboarding — manual handoff', 'Offer rescission doesn\'t alert onboarding team'],
    ourReplacement: 'Recruitment pipeline with auto-onboarding trigger',
  },
  {
    name: 'Smartsheet',
    category: 'Onboarding',
    usedBy: ['Lucas Young', 'Sam', 'Rebecca Burns'],
    issues: ['3+ separate forms', 'Wrong link sent to Devon Tull', 'No status dashboard', 'Manual add after offer accepted'],
    ourReplacement: 'Single crew portal — position-specific checklist auto-generated',
  },
  {
    name: 'Rippling',
    category: 'HRIS/Payroll',
    usedBy: ['Lucas Young', 'Kelly'],
    issues: ['New hires wait for "the Rippling email"', 'No visibility into enrollment status'],
    ourReplacement: 'Gusto sync — profiles created automatically from crew data',
  },
  {
    name: 'Sterling',
    category: 'Background Check',
    usedBy: ['New hire (receives link)'],
    issues: ['Status only visible via email', 'No dashboard — must check Sterling portal separately'],
    ourReplacement: 'Status tracked in unified dashboard with auto-reminders',
  },
  {
    name: 'LabCorp',
    category: 'Drug Testing',
    usedBy: ['Kelly (own login)', 'Lucas'],
    issues: ['Kelly has separate login — Lucas can\'t see results', '185-day rule tracked manually'],
    ourReplacement: 'Unified D&A status — Drug Free Vessel administers, we display + alert',
  },
  {
    name: 'Quest Diagnostics',
    category: 'Drug Testing',
    usedBy: ['Kelly (own login)', 'Lucas'],
    issues: ['Second drug test portal — different login', 'No cross-reference with LabCorp'],
    ourReplacement: 'Same unified D&A dashboard',
  },
  {
    name: 'Drug Free Business',
    category: 'D&A Compliance',
    usedBy: ['Lucas (inherited Billie Jo\'s login)'],
    issues: ['Third portal for D&A', 'Consortium status not visible to crew managers'],
    ourReplacement: 'Compliance status visible across all roles',
  },
  {
    name: 'HELM Connect',
    category: 'Crew Scheduling',
    usedBy: ['Stephen Kennedy', 'Sam'],
    issues: ['"Using as a sandbox"', '$20K/yr', 'IMO fields blank', '7 of 48 billets assigned', 'Zero reports configured'],
    ourReplacement: 'Full crew rotation + billet management — actually works',
  },
  {
    name: 'Egencia',
    category: 'Travel',
    usedBy: ['Sam', 'Lucas', 'Alicia'],
    issues: ['Shared password — one person changes it, everyone locked out', 'No connection to crew schedule'],
    ourReplacement: 'C Teleport integration — auto-book from crew change schedule',
  },
  {
    name: 'SharePoint',
    category: 'Documents',
    usedBy: ['Lucas', 'Standing Tide team'],
    issues: ['SOPs scattered', 'Active Recruiting spreadsheet manual', 'Two SharePoints (ST + LEX)'],
    ourReplacement: 'Document storage with credential expiry tracking',
  },
  {
    name: 'JotForm',
    category: 'Uniforms',
    usedBy: ['New hires'],
    issues: ['Separate system just for uniform ordering', 'No connection to onboarding status'],
    ourReplacement: 'Onboarding step — same portal, same flow',
  },
  {
    name: 'Email',
    category: 'Everything',
    usedBy: ['Everyone'],
    issues: ['Actual system of record', 'No audit trail', 'Kayla gets "a slew of" reach-outs from confused new hires'],
    ourReplacement: 'Automated notifications + crew portal — new hires see their own status',
  },
];

// ── Documented Process Failures ──

export const processFailures: ProcessFailure[] = [
  {
    id: 'pf-sjb',
    title: 'Falsified SAP Documents',
    person: 'Sebastian Jean-Baptiste',
    date: 'April 2026',
    description: 'Candidate altered Substance Abuse Professional completion documents and lied about program completion. 10+ days of onboarding time lost before discovery.',
    impact: 'Sebastian reached out to Kayla, Sam, and Rebecca asking about travel — nobody knew his status was blocked because the onboarding checklist wasn\'t checked daily.',
    quote: 'This is a serious process concern. We should not have crew having to reach out to get information nor can we be losing 10 days of onboarding time when we have urgent needs for crew onboard.',
    quoteBy: 'Jenelle Findley, LEX Leadership',
    toolsInvolved: ['Lever', 'Smartsheet', 'Email'],
    ourPrevention: 'SAP verification status tracked in real-time. Block auto-applied when verification fails. All stakeholders see the block immediately — no one sends travel details to a blocked candidate.',
  },
  {
    id: 'pf-dt',
    title: 'Panama Embarkation Crisis',
    person: 'Devon Tull',
    date: 'October 2025',
    description: 'Chief Mate hire — Lucas sent wrong Smartsheet link (full spreadsheet instead of upload form). Passport never uploaded. Panama customs documents submitted without Devon on crew manifest.',
    impact: 'Captain and Purser escalated urgently. Multiple customs documents needed resubmission 6 days before Panama Canal transit. Jim intervened personally.',
    toolsInvolved: ['Smartsheet', 'Email', 'Egencia'],
    ourPrevention: 'Passport is a required field in onboarding — crew portal won\'t show "complete" without it. Auto-attached to customs manifests. Purser sees real-time crew status.',
  },
  {
    id: 'pf-ad',
    title: 'Employment Record Gap',
    person: 'Amanda Dow',
    date: 'March 2026',
    description: 'Rehire needed proof of drug test pool enrollment for Oct 31 – Dec 9, 2025 contract. No employment record existed for that period despite sea time letter.',
    impact: 'MMC renewal blocked by USCG. 2+ months of email exchanges between Lucas, Alicia, and Stephen — still unresolved. Crew member can\'t sail.',
    toolsInvolved: ['LabCorp', 'Quest', 'Drug Free Business', 'Email'],
    ourPrevention: 'Employment and D&A pool enrollment tracked in same system. Every contract period auto-generates employment record. No gaps possible.',
  },
  {
    id: 'pf-helm',
    title: 'HELM as "Sandbox"',
    person: 'Stephen Kennedy',
    date: 'May 2026',
    description: 'Fleet Training Officer admitted the $20K/yr crew management system doesn\'t know who\'s actually on board. Crew changes haven\'t been acknowledged for months. Sea Bird shows crew from December.',
    impact: 'No accurate crew count on any vessel. Reports can\'t be generated. System is decorative.',
    quote: 'We\'re essentially just using Helm as a sandbox environment.',
    quoteBy: 'Stephen Kennedy, Fleet Training Officer',
    toolsInvolved: ['HELM Connect'],
    ourPrevention: 'Crew changes flow from C&G → billet assignment → watch bill automatically. System always reflects reality because it IS the workflow.',
  },
  {
    id: 'pf-egencia',
    title: 'Travel System Lockout',
    person: 'Lucas Young',
    date: 'March 2026',
    description: 'Shared Egencia login — password was changed, nobody could find the new one. HR and travel booking both blocked.',
    impact: 'Unable to book crew travel during active crew change period.',
    quote: 'Do you know if Lindblad\'s crew travel account on Egencia was changed? Neither Alicia nor I can get in with the old password.',
    quoteBy: 'Lucas Young, Shipboard HR Manager',
    toolsInvolved: ['Egencia'],
    ourPrevention: 'Travel booking integrated into platform. No shared passwords. Each user has role-based access. Travel auto-booked from crew change schedule.',
  },
  {
    id: 'pf-drug',
    title: 'Invisible Drug Test Status',
    person: 'Bradley Wardle',
    date: 'October 2025',
    description: 'Lucas couldn\'t verify if drug test was ordered because Kelly has a separate LabCorp login. Three different portals, different credentials, different people.',
    impact: 'New hire onboarding delayed — nobody has complete D&A visibility.',
    quote: 'Has Bradley\'s drug test been put through? I don\'t see him in Labcorp or Quest, but they may be because Kelly has her own login.',
    quoteBy: 'Lucas Young, Shipboard HR Manager',
    toolsInvolved: ['LabCorp', 'Quest', 'Drug Free Business'],
    ourPrevention: 'Drug Free Vessel handles administration. Our dashboard shows status, last test date, next test date, consortium enrollment — visible to everyone who needs it.',
  },
];

// ── Summary Stats ──

export function getPipelineStats() {
  const active = candidates.filter(c => c.status === 'active');
  const blocked = candidates.filter(c => c.status === 'blocked');
  const cleared = candidates.filter(c => c.status === 'cleared');
  const rescinded = candidates.filter(c => c.status === 'rescinded');
  
  const inHiring = candidates.filter(c => {
    const stage = pipelineStages.find(s => s.id === c.currentStage);
    return stage?.phase === 'hiring' && c.status !== 'rescinded';
  });
  const inOnboarding = candidates.filter(c => {
    const stage = pipelineStages.find(s => s.id === c.currentStage);
    return (stage?.phase === 'onboarding' || stage?.phase === 'compliance') && c.status !== 'rescinded';
  });
  
  const avgDaysInPipeline = Math.round(
    candidates.filter(c => c.status !== 'rescinded').reduce((sum, c) => sum + c.daysInPipeline, 0) / 
    candidates.filter(c => c.status !== 'rescinded').length
  );
  
  const totalBlockers = candidates.reduce((sum, c) => sum + c.blockers.length, 0);
  
  return {
    total: candidates.length,
    active: active.length,
    blocked: blocked.length,
    cleared: cleared.length,
    rescinded: rescinded.length,
    inHiring: inHiring.length,
    inOnboarding: inOnboarding.length,
    avgDaysInPipeline,
    totalBlockers,
    toolCount: fragmentedTools.length,
    failureCount: processFailures.length,
  };
}
