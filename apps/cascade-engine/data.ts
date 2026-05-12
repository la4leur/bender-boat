import { DisruptionType, WeeklySnapshot, ChangeEvent } from './types';

export const disruptions: DisruptionType[] = [
  {
    id: 'resignation',
    name: 'Unexpected Resignation',
    icon: '🚪',
    severity: 'critical',
    description: 'Crew member gives notice or walks off — billet goes unfilled immediately, triggering hiring pipeline and potential sailing-short scenario.',
    realExample: 'From your 5/11 C&G: 14-week unfilled billet tracking shows resignations are the #1 cause of gaps, with some billets open 8+ weeks while the manual process catches up.',
    gearsAffected: ['crew-rotation', 'hiring-onboarding', 'training-compliance', 'vessel-schedule'],
    cascadeSteps: [
      { id: 'r1', gear: 'crew-rotation', order: 1, timeOffset: 'Hour 0', title: 'Billet Goes Unfilled', description: 'Position marked open. Offgoing crew member\'s last day set. Vessel manning drops below complement.', impact: 'blocking', triggersNext: ['r2', 'r3'] },
      { id: 'r2', gear: 'vessel-schedule', order: 2, timeOffset: 'Hour 0', title: 'Manning Impact Assessment', description: 'System checks: Can vessel sail with current complement? Is this a USCG-required position? If critical (Master, Chief Mate, Chief Engineer), vessel CANNOT sail.', impact: 'blocking', triggersNext: ['r4'] },
      { id: 'r3', gear: 'crew-rotation', order: 2, timeOffset: 'Hour 1', title: 'Relief Pool Check', description: 'System searches qualified crew in rotation pool — anyone certified for this billet who\'s in their off period? If yes, skip to travel booking. If no, hiring gear activates.', impact: 'degraded', triggersNext: ['r5'] },
      { id: 'r4', gear: 'vessel-schedule', order: 3, timeOffset: 'Hour 2', title: 'Schedule Risk Flag', description: 'If no relief available within rotation pool, vessel schedule gets a risk flag. All downstream port calls and crew changes for this vessel are marked "at risk."', impact: 'awareness' },
      { id: 'r5', gear: 'hiring-onboarding', order: 4, timeOffset: 'Day 1', title: 'Requisition Auto-Opens', description: 'Hiring pipeline activates: position, vessel class, required certifications, target deploy date all pre-filled from the billet record.', impact: 'blocking', triggersNext: ['r6'] },
      { id: 'r6', gear: 'hiring-onboarding', order: 5, timeOffset: 'Day 1-14', title: 'Sourcing & Screening', description: 'Candidates sourced against cert requirements. System flags candidates who are "deploy-ready" (all certs current) vs. "needs remediation" (cert gaps).', impact: 'degraded', triggersNext: ['r7'] },
      { id: 'r7', gear: 'training-compliance', order: 6, timeOffset: 'Day 7-21', title: 'Cert Gap Analysis for Candidate', description: 'Selected candidate\'s credentials checked against LEX 2025 position requirements. Any gaps flagged with remediation timeline. STCW BST, TWIC, MMC, vessel-class-specific certs all verified.', impact: 'blocking', triggersNext: ['r8'] },
      { id: 'r8', gear: 'training-compliance', order: 7, timeOffset: 'Day 14-28', title: 'Training Scheduled / Certs Obtained', description: 'Gap remediation: courses scheduled, applications submitted, renewal exams booked. Each cert has a lead time — TWIC takes 8-12 weeks, MMC renewal 4-6 weeks.', impact: 'blocking', triggersNext: ['r9'] },
      { id: 'r9', gear: 'hiring-onboarding', order: 8, timeOffset: 'Day 21-35', title: 'D&A Enrollment + Background', description: 'Drug Free Vessel consortium enrollment, pre-employment drug test, background check. Gate: cannot proceed to deployment without clear results.', impact: 'blocking', triggersNext: ['r10'] },
      { id: 'r10', gear: 'crew-rotation', order: 9, timeOffset: 'Day 28-42', title: 'Travel Booked + Crew Change Scheduled', description: 'Flights, hotels, ground transport booked for replacement. Crew change port and date confirmed against vessel schedule. Travel packet pushed.', impact: 'degraded', triggersNext: ['r11'] },
      { id: 'r11', gear: 'vessel-schedule', order: 10, timeOffset: 'Day 35-45', title: 'Billet Filled — Manning Restored', description: 'Replacement boards. Manning restored to full complement. Unfilled billet tracker closes the gap. Weekly report reflects resolution.', impact: 'awareness' },
    ],
    checklist: [
      { id: 'rc1', gear: 'crew-rotation', action: 'Mark billet as unfilled with effective date and reason code', owner: 'Sam (Ops)', deadline: 'Immediately', critical: true, automatable: true, automationNote: 'Auto-triggered when crew status changes to "Resigned"' },
      { id: 'rc2', gear: 'vessel-schedule', action: 'Assess manning impact — can vessel sail?', owner: 'Sam (Ops)', deadline: 'Within 2 hours', critical: true, automatable: true, automationNote: 'System auto-checks USCG minimum manning against current complement' },
      { id: 'rc3', gear: 'crew-rotation', action: 'Check relief pool for qualified, available crew', owner: 'Sam (Ops)', deadline: 'Within 4 hours', critical: true, automatable: true, automationNote: 'System searches rotation pool by position + cert match + availability' },
      { id: 'rc4', gear: 'crew-rotation', action: 'Notify vessel captain of crew change timeline', owner: 'Sam (Ops)', deadline: 'Within 4 hours', critical: true, automatable: true, automationNote: 'Auto-notification via SMS/email with expected resolution date' },
      { id: 'rc5', gear: 'hiring-onboarding', action: 'Open requisition if no relief in pool', owner: 'Sam (Ops)', deadline: 'Day 1', critical: true, automatable: true, automationNote: 'Auto-opens with billet requirements pre-filled from position template' },
      { id: 'rc6', gear: 'hiring-onboarding', action: 'Source candidates — internal transfers first, then external', owner: 'Recruiting', deadline: 'Day 1-7', critical: false, automatable: false },
      { id: 'rc7', gear: 'training-compliance', action: 'Run cert gap analysis on shortlisted candidates', owner: 'Sam (Ops)', deadline: 'At candidate selection', critical: true, automatable: true, automationNote: 'Auto-compares candidate certs against LEX position requirements matrix' },
      { id: 'rc8', gear: 'training-compliance', action: 'Schedule remediation training for cert gaps', owner: 'Training Coordinator', deadline: 'Within 3 days of hire', critical: true, automatable: false, dependsOn: ['rc7'] },
      { id: 'rc9', gear: 'hiring-onboarding', action: 'Initiate D&A pre-employment test via Drug Free Vessel', owner: 'HR', deadline: 'At offer acceptance', critical: true, automatable: true, automationNote: 'System tracks D&A status; blocks deployment until clear' },
      { id: 'rc10', gear: 'hiring-onboarding', action: 'Initiate background check', owner: 'HR', deadline: 'At offer acceptance', critical: true, automatable: false, dependsOn: ['rc9'] },
      { id: 'rc11', gear: 'training-compliance', action: 'Verify all certs current — STCW, TWIC, MMC, CGMed, vessel-class specific', owner: 'Sam (Ops)', deadline: 'Before travel booking', critical: true, automatable: true, automationNote: 'System gates travel booking until all cert checks pass', dependsOn: ['rc8'] },
      { id: 'rc12', gear: 'crew-rotation', action: 'Book travel — flights, hotel, ground transport', owner: 'Kelly / System', deadline: '14 days before crew change', critical: true, automatable: true, automationNote: 'C Teleport API books marine fares; travel packet auto-generated', dependsOn: ['rc11'] },
      { id: 'rc13', gear: 'crew-rotation', action: 'Push travel packet to crew member', owner: 'System', deadline: 'At booking confirmation', critical: false, automatable: true, automationNote: 'SMS + email + portal link — no login required' },
      { id: 'rc14', gear: 'crew-rotation', action: 'Confirm crew change logistics with port agent', owner: 'Sam (Ops)', deadline: '7 days before crew change', critical: false, automatable: false },
      { id: 'rc15', gear: 'vessel-schedule', action: 'Update weekly crewing report to reflect resolution', owner: 'System', deadline: 'Next Monday', critical: false, automatable: true, automationNote: 'Auto-generated — Sam no longer builds this manually' },
    ]
  },
  {
    id: 'missed-flight',
    name: 'Missed Flight',
    icon: '✈️',
    severity: 'high',
    description: 'Crew member misses their travel connection — crew change delayed, offgoing crew extended, vessel schedule at risk.',
    realExample: 'Captain Wilson\'s email: crew missed a Saturday 4:40 AM connection. Sam was mid-move, Kelly got woken up. Nobody could rebook until business hours. With Lifeline + AI Guardrails, this resolves in 61 seconds with zero phone calls.',
    gearsAffected: ['crew-rotation', 'vessel-schedule', 'training-compliance'],
    cascadeSteps: [
      { id: 'mf1', gear: 'crew-rotation', order: 1, timeOffset: 'Hour 0', title: 'Flight Missed — Crew Stranded', description: 'System detects missed connection (airline API or crew self-report via Lifeline portal). Location and reason captured automatically.', impact: 'blocking', triggersNext: ['mf2', 'mf3'] },
      { id: 'mf2', gear: 'crew-rotation', order: 2, timeOffset: 'Minutes 1-5', title: 'Lifeline AI Activates', description: 'Green tier: AI auto-books next available flight if under cost threshold. Yellow tier: AI picks options, coordinator reviews in morning. Red tier: SMS escalation. No one gets woken up for routine rebooking.', impact: 'degraded', triggersNext: ['mf4'] },
      { id: 'mf3', gear: 'vessel-schedule', order: 2, timeOffset: 'Hour 0', title: 'Crew Change Delay Assessment', description: 'System calculates: How long until replacement arrives? Can vessel hold in port? If underway, what\'s the next viable crew change port?', impact: 'blocking', triggersNext: ['mf5'] },
      { id: 'mf4', gear: 'crew-rotation', order: 3, timeOffset: 'Hours 1-6', title: 'Rebooked — New Travel Packet', description: 'New flight booked. Updated travel packet pushed to crew member. Change Portal logs cost delta. Kelly sees the price difference in real-time, not 3 weeks later.', impact: 'awareness' },
      { id: 'mf5', gear: 'training-compliance', order: 4, timeOffset: 'Hour 0', title: 'STCW Rest Check for Extended Crew', description: 'Offgoing crew member now extended. System checks: Are they approaching STCW rest hour limits? Will the delay push them into a violation? If yes, watch rotation must adjust.', impact: 'blocking', triggersNext: ['mf6'] },
      { id: 'mf6', gear: 'vessel-schedule', order: 5, timeOffset: 'Hours 2-12', title: 'Watch Rotation Adjusted', description: 'If offgoing crew extended beyond STCW limits, watch assignments must change. System recalculates watch rotation to keep vessel in compliance while shorthanded or during handoff overlap.', impact: 'degraded' },
      { id: 'mf7', gear: 'crew-rotation', order: 6, timeOffset: 'Day +1', title: 'Accountability Log Updated', description: 'Incident logged: crew-fault vs. airline-fault classification. Cost attribution assigned. Pattern detection checks — is this crew member a repeat? Morning digest includes the event.', impact: 'awareness' },
    ],
    checklist: [
      { id: 'mfc1', gear: 'crew-rotation', action: 'Confirm crew member location and status', owner: 'On-Duty Coordinator', deadline: 'Immediately', critical: true, automatable: true, automationNote: 'Lifeline portal captures location + reason automatically' },
      { id: 'mfc2', gear: 'crew-rotation', action: 'Rebook next available flight', owner: 'Lifeline AI / Coordinator', deadline: 'Within 30 minutes', critical: true, automatable: true, automationNote: 'AI auto-books if Green tier; human review if Yellow/Red' },
      { id: 'mfc3', gear: 'crew-rotation', action: 'Push updated travel packet to crew', owner: 'System', deadline: 'At rebooking', critical: true, automatable: true, automationNote: 'Auto-push via SMS + email with highlighted changes' },
      { id: 'mfc4', gear: 'vessel-schedule', action: 'Notify vessel captain of delay and new ETA', owner: 'System', deadline: 'Within 1 hour', critical: true, automatable: true, automationNote: 'Auto-notification with updated crew change timeline' },
      { id: 'mfc5', gear: 'training-compliance', action: 'Check STCW rest hours for extended offgoing crew', owner: 'System', deadline: 'Immediately', critical: true, automatable: true, automationNote: 'Auto-calculates rest compliance impact of delay' },
      { id: 'mfc6', gear: 'vessel-schedule', action: 'Adjust watch rotation if STCW risk', owner: 'Captain / Mate', deadline: 'Before next watch', critical: true, automatable: false, dependsOn: ['mfc5'] },
      { id: 'mfc7', gear: 'crew-rotation', action: 'Notify offgoing crew of extended assignment', owner: 'Sam (Ops)', deadline: 'Within 2 hours', critical: false, automatable: true, automationNote: 'Auto-SMS with explanation and new relief ETA' },
      { id: 'mfc8', gear: 'crew-rotation', action: 'Log cost delta in Change Portal', owner: 'System', deadline: 'At rebooking', critical: false, automatable: true, automationNote: 'Kelly sees original vs. rebooked cost automatically' },
      { id: 'mfc9', gear: 'crew-rotation', action: 'Classify fault — crew vs. airline', owner: 'Coordinator', deadline: 'Day +1', critical: false, automatable: false },
      { id: 'mfc10', gear: 'crew-rotation', action: 'Update accountability log + pattern check', owner: 'System', deadline: 'Day +1', critical: false, automatable: true, automationNote: 'Auto-checks for repeat incidents by crew member' },
    ]
  },
  {
    id: 'cert-failure',
    name: 'Failed / Expired Certification',
    icon: '📋',
    severity: 'high',
    description: 'Crew member\'s certification expires or training not completed — they cannot legally board the vessel.',
    realExample: 'HELM shows 325 missing certifications and 30 expired across the Lindblad fleet right now — with zero automated alerts. The LEX 2025 matrix requires up to 18 certs per position. One gap blocks embarkation.',
    gearsAffected: ['training-compliance', 'crew-rotation', 'hiring-onboarding', 'vessel-schedule'],
    cascadeSteps: [
      { id: 'cf1', gear: 'training-compliance', order: 1, timeOffset: 'Day -90', title: 'Expiry Warning (90 days)', description: 'System detects upcoming cert expiry. Alert sent to crew member + ops. Renewal timeline mapped — some certs take 8-12 weeks (TWIC).', impact: 'awareness', triggersNext: ['cf2'] },
      { id: 'cf2', gear: 'training-compliance', order: 2, timeOffset: 'Day -60', title: 'Renewal Action Required', description: 'If no renewal action taken, escalation. System blocks future crew change bookings for this crew member until cert is renewed or waiver obtained.', impact: 'degraded', triggersNext: ['cf3'] },
      { id: 'cf3', gear: 'crew-rotation', order: 3, timeOffset: 'Day -30', title: 'Crew Change Booking Blocked', description: 'Upcoming crew change for this crew member is flagged RED. Cannot book travel until cert resolved. Rotation planner shows gap.', impact: 'blocking', triggersNext: ['cf4', 'cf5'] },
      { id: 'cf4', gear: 'hiring-onboarding', order: 4, timeOffset: 'Day -30', title: 'Backup Crew Search', description: 'If renewal timeline exceeds crew change date, system searches relief pool for qualified alternative. May need to open temporary requisition.', impact: 'degraded' },
      { id: 'cf5', gear: 'vessel-schedule', order: 5, timeOffset: 'Day -14', title: 'Manning Risk Escalation', description: 'If no resolution, vessel schedule flagged. Captain notified of potential manning gap at next crew change.', impact: 'blocking' },
      { id: 'cf6', gear: 'training-compliance', order: 6, timeOffset: 'Day 0', title: 'Cert Expired — Hard Block', description: 'Crew member cannot board. Period. USCG requirement — no waiver for expired STCW, MMC, or TWIC. System enforces this gate absolutely.', impact: 'blocking' },
    ],
    checklist: [
      { id: 'cfc1', gear: 'training-compliance', action: 'Send 90-day expiry warning to crew member', owner: 'System', deadline: '90 days before expiry', critical: false, automatable: true, automationNote: 'Auto-alert via SMS/email with renewal instructions' },
      { id: 'cfc2', gear: 'training-compliance', action: 'Verify renewal application submitted', owner: 'Sam (Ops)', deadline: '60 days before expiry', critical: true, automatable: false },
      { id: 'cfc3', gear: 'training-compliance', action: 'Track renewal through pipeline (submitted → processing → issued)', owner: 'System', deadline: 'Ongoing', critical: true, automatable: true, automationNote: 'Status tracking with lead time alerts' },
      { id: 'cfc4', gear: 'crew-rotation', action: 'Flag upcoming crew change as at-risk', owner: 'System', deadline: '30 days before crew change', critical: true, automatable: true, automationNote: 'Auto-flags when cert expiry < crew change date and no renewal confirmed' },
      { id: 'cfc5', gear: 'crew-rotation', action: 'Identify backup crew from relief pool', owner: 'Sam (Ops)', deadline: '21 days before crew change', critical: true, automatable: true, automationNote: 'System ranks alternatives by cert readiness + availability', dependsOn: ['cfc4'] },
      { id: 'cfc6', gear: 'vessel-schedule', action: 'Notify captain of manning risk', owner: 'System', deadline: '14 days before crew change', critical: true, automatable: true, automationNote: 'Auto-notification with impact assessment' },
      { id: 'cfc7', gear: 'hiring-onboarding', action: 'Open temp requisition if no pool relief available', owner: 'Sam (Ops)', deadline: '14 days before', critical: false, automatable: true, automationNote: 'Pre-filled from billet requirements' },
      { id: 'cfc8', gear: 'training-compliance', action: 'Hard-block embarkation if cert not resolved', owner: 'System', deadline: 'Day 0', critical: true, automatable: true, automationNote: 'Absolute gate — cannot override without documented waiver' },
    ]
  },
  {
    id: 'medical-disembark',
    name: 'Medical Disembarkation',
    icon: '🏥',
    severity: 'critical',
    description: 'Crew member injured or ill — must leave vessel immediately. Emergency crew change required, often at non-standard port.',
    realExample: 'From unfilled billets data: medical disembarkations account for multiple open billets across vessels, some unresolved for 4+ weeks. Current process has zero system support — all phone calls and ad-hoc coordination.',
    gearsAffected: ['vessel-schedule', 'crew-rotation', 'hiring-onboarding', 'training-compliance'],
    cascadeSteps: [
      { id: 'md1', gear: 'vessel-schedule', order: 1, timeOffset: 'Hour 0', title: 'Vessel May Divert', description: 'Depending on severity, vessel may need to divert to nearest port with medical facilities. Schedule disruption affects all downstream port calls.', impact: 'blocking', triggersNext: ['md2'] },
      { id: 'md2', gear: 'crew-rotation', order: 2, timeOffset: 'Hour 0', title: 'Emergency Crew Change Initiated', description: 'Billet immediately unfilled. Emergency replacement needed. System identifies nearest viable crew change port (may not be on original schedule).', impact: 'blocking', triggersNext: ['md3', 'md4'] },
      { id: 'md3', gear: 'crew-rotation', order: 3, timeOffset: 'Hours 1-4', title: 'Repatriation Arranged for Injured Crew', description: 'Medical transport, commercial flight, hotel if needed. Insurance/P&I club coordination. Travel packet for medical crew member.', impact: 'degraded' },
      { id: 'md4', gear: 'hiring-onboarding', order: 3, timeOffset: 'Hours 1-4', title: 'Emergency Sourcing — Fastest Qualified Replacement', description: 'System searches relief pool ranked by: 1) All certs current, 2) Closest to crew change port, 3) Earliest available. Travel booked simultaneously.', impact: 'blocking', triggersNext: ['md5'] },
      { id: 'md5', gear: 'training-compliance', order: 4, timeOffset: 'Hours 2-8', title: 'Emergency Cert Verification', description: 'Replacement candidate\'s full cert suite verified against position requirements. No shortcuts — USCG doesn\'t care that it\'s an emergency.', impact: 'blocking', triggersNext: ['md6'] },
      { id: 'md6', gear: 'vessel-schedule', order: 5, timeOffset: 'Day 1-3', title: 'Schedule Reconstituted', description: 'Once replacement ETA confirmed, vessel schedule re-optimized. Downstream crew changes and port calls adjusted. All affected parties notified.', impact: 'awareness' },
    ],
    checklist: [
      { id: 'mdc1', gear: 'vessel-schedule', action: 'Assess diversion need — coordinate with captain', owner: 'Eric / Sam', deadline: 'Immediately', critical: true, automatable: false },
      { id: 'mdc2', gear: 'crew-rotation', action: 'Mark billet unfilled — reason: Medical', owner: 'System', deadline: 'Immediately', critical: true, automatable: true, automationNote: 'Triggered by incident report' },
      { id: 'mdc3', gear: 'crew-rotation', action: 'Arrange medical repatriation for injured crew', owner: 'Sam (Ops)', deadline: 'Within hours', critical: true, automatable: false },
      { id: 'mdc4', gear: 'hiring-onboarding', action: 'Search relief pool — rank by cert readiness + proximity', owner: 'System', deadline: 'Within 2 hours', critical: true, automatable: true, automationNote: 'Auto-ranked search with one-tap deploy' },
      { id: 'mdc5', gear: 'training-compliance', action: 'Verify all certs for emergency replacement', owner: 'System', deadline: 'Before travel booking', critical: true, automatable: true, automationNote: 'Hard gate — no shortcuts even in emergencies' },
      { id: 'mdc6', gear: 'crew-rotation', action: 'Book emergency travel for replacement', owner: 'System / Lifeline', deadline: 'Within 4 hours', critical: true, automatable: true, automationNote: 'Lifeline AI handles off-hours booking', dependsOn: ['mdc5'] },
      { id: 'mdc7', gear: 'vessel-schedule', action: 'Reconstitute vessel schedule with new crew change port/date', owner: 'Sam (Ops)', deadline: 'Day 1', critical: true, automatable: false },
      { id: 'mdc8', gear: 'crew-rotation', action: 'Notify all affected crew of schedule changes', owner: 'System', deadline: 'At reconstitution', critical: false, automatable: true, automationNote: 'Updated travel packets pushed automatically' },
      { id: 'mdc9', gear: 'vessel-schedule', action: 'File incident report + insurance/P&I notification', owner: 'Eric', deadline: 'Day 1-3', critical: true, automatable: false },
    ]
  },
  {
    id: 'schedule-change',
    name: 'Vessel Schedule Change',
    icon: '🗓️',
    severity: 'high',
    description: 'Itinerary changes due to weather, charter modification, or mechanical issue — every downstream crew change, flight, and hotel shifts.',
    realExample: 'When a vessel schedule shifts by even 2 days, every pending crew change needs rebooking. With 63 upcoming crew changes across the fleet, a single schedule change can trigger 15-20 rebookings — each one a phone call in the current process.',
    gearsAffected: ['vessel-schedule', 'crew-rotation', 'training-compliance', 'hiring-onboarding'],
    cascadeSteps: [
      { id: 'sc1', gear: 'vessel-schedule', order: 1, timeOffset: 'Hour 0', title: 'Schedule Modification Entered', description: 'New port dates, route change, or delay entered. System instantly identifies every affected downstream event.', impact: 'blocking', triggersNext: ['sc2'] },
      { id: 'sc2', gear: 'crew-rotation', order: 2, timeOffset: 'Hour 0', title: 'All Pending Crew Changes Flagged', description: 'Every crew change on this vessel with dates affected turns yellow. System calculates: which flights still work, which need rebooking, which crew changes need a new port.', impact: 'degraded', triggersNext: ['sc3', 'sc4'] },
      { id: 'sc3', gear: 'crew-rotation', order: 3, timeOffset: 'Hours 1-4', title: 'Bulk Travel Rebooking', description: 'Flights that no longer align are cancelled and rebooked. Hotels adjusted. Ground transport rescheduled. Change Portal captures every cost delta.', impact: 'degraded', triggersNext: ['sc5'] },
      { id: 'sc4', gear: 'training-compliance', order: 3, timeOffset: 'Hour 1', title: 'Cert Expiry vs. New Dates Check', description: 'Schedule shift may push a crew change past a cert expiry date. System re-validates all certs against new timeline. Any new conflicts flagged immediately.', impact: 'blocking' },
      { id: 'sc5', gear: 'crew-rotation', order: 4, timeOffset: 'Hours 2-8', title: 'Updated Travel Packets Pushed', description: 'Every affected crew member gets an updated travel packet with changes highlighted. Via SMS/email — they see exactly what changed without logging in anywhere.', impact: 'awareness' },
      { id: 'sc6', gear: 'hiring-onboarding', order: 5, timeOffset: 'Day 1', title: 'Pipeline Deploy Dates Adjusted', description: 'Anyone in the hiring pipeline targeted for this vessel has their deploy date shifted. Training deadlines adjust accordingly.', impact: 'awareness' },
    ],
    checklist: [
      { id: 'scc1', gear: 'vessel-schedule', action: 'Enter schedule modification with affected date range', owner: 'Sam (Ops)', deadline: 'Immediately', critical: true, automatable: false },
      { id: 'scc2', gear: 'crew-rotation', action: 'Identify all affected crew changes', owner: 'System', deadline: 'Instantly', critical: true, automatable: true, automationNote: 'Auto-identifies every crew change with dates in affected range' },
      { id: 'scc3', gear: 'crew-rotation', action: 'Assess which flights still work vs. need rebooking', owner: 'System', deadline: 'Within 1 hour', critical: true, automatable: true, automationNote: 'Compares new dates against existing itineraries' },
      { id: 'scc4', gear: 'training-compliance', action: 'Re-validate cert expiries against new timeline', owner: 'System', deadline: 'Within 1 hour', critical: true, automatable: true, automationNote: 'Flags any new cert/date conflicts' },
      { id: 'scc5', gear: 'crew-rotation', action: 'Cancel and rebook affected flights', owner: 'System / Kelly', deadline: 'Within 4 hours', critical: true, automatable: true, automationNote: 'C Teleport API handles rebooking; cost deltas logged automatically', dependsOn: ['scc3'] },
      { id: 'scc6', gear: 'crew-rotation', action: 'Adjust hotel and ground transport bookings', owner: 'Kelly', deadline: 'Within 4 hours', critical: false, automatable: false, dependsOn: ['scc5'] },
      { id: 'scc7', gear: 'crew-rotation', action: 'Push updated travel packets to all affected crew', owner: 'System', deadline: 'At rebooking', critical: true, automatable: true, automationNote: 'Changes highlighted in updated packet' },
      { id: 'scc8', gear: 'hiring-onboarding', action: 'Shift pipeline deploy dates', owner: 'System', deadline: 'Day 1', critical: false, automatable: true, automationNote: 'Auto-adjusts hiring timeline targets' },
      { id: 'scc9', gear: 'vessel-schedule', action: 'Update weekly crewing report', owner: 'System', deadline: 'Next cycle', critical: false, automatable: true, automationNote: 'Changes reflected automatically in Monday report' },
    ]
  },
  {
    id: 'visa-denial',
    name: 'Visa / Port Entry Denial',
    icon: '🛂',
    severity: 'medium',
    description: 'Crew member denied entry at crew change port — need alternate port, alternate crew, or both.',
    realExample: 'Bermuda crew changes require specific entry documentation. If a crew member shows up without the right paperwork, the crew change fails and the vessel either waits or sails short. The Visa Builder prevents this by flagging requirements 90 days out.',
    gearsAffected: ['crew-rotation', 'vessel-schedule', 'training-compliance'],
    cascadeSteps: [
      { id: 'vd1', gear: 'crew-rotation', order: 1, timeOffset: 'Hour 0', title: 'Entry Denied at Port', description: 'Crew member cannot clear customs/immigration. Crew change cannot proceed at this port.', impact: 'blocking', triggersNext: ['vd2', 'vd3'] },
      { id: 'vd2', gear: 'vessel-schedule', order: 2, timeOffset: 'Hour 0', title: 'Alternate Crew Change Port Assessment', description: 'System identifies next port on vessel route where crew member CAN enter. Calculates delay impact.', impact: 'degraded', triggersNext: ['vd4'] },
      { id: 'vd3', gear: 'crew-rotation', order: 2, timeOffset: 'Hours 1-4', title: 'Alternate Crew Member Check', description: 'Can we send someone else who already has the right visa/entry docs? System searches relief pool filtered by port entry eligibility.', impact: 'degraded' },
      { id: 'vd4', gear: 'crew-rotation', order: 3, timeOffset: 'Hours 2-12', title: 'Travel Rebooking', description: 'Either rebook denied crew to alternate port, or book alternate crew to original port. Cost delta logged.', impact: 'degraded' },
      { id: 'vd5', gear: 'training-compliance', order: 4, timeOffset: 'Day 1', title: 'Visa Tracking Updated', description: 'Incident logged. Visa status for this crew member updated. System adjusts future crew change port assignments to avoid repeat.', impact: 'awareness' },
    ],
    checklist: [
      { id: 'vdc1', gear: 'crew-rotation', action: 'Confirm denial and document reason', owner: 'Port Agent / Sam', deadline: 'Immediately', critical: true, automatable: false },
      { id: 'vdc2', gear: 'vessel-schedule', action: 'Identify alternate crew change port on vessel route', owner: 'System', deadline: 'Within 2 hours', critical: true, automatable: true, automationNote: 'Auto-identifies ports where crew member has valid entry docs' },
      { id: 'vdc3', gear: 'crew-rotation', action: 'Check for alternate crew with valid port entry docs', owner: 'System', deadline: 'Within 2 hours', critical: true, automatable: true, automationNote: 'Relief pool filtered by visa/entry eligibility' },
      { id: 'vdc4', gear: 'crew-rotation', action: 'Rebook travel to alternate port or for alternate crew', owner: 'System / Kelly', deadline: 'Within 4 hours', critical: true, automatable: true, automationNote: 'C Teleport rebooking with cost tracking', dependsOn: ['vdc2', 'vdc3'] },
      { id: 'vdc5', gear: 'training-compliance', action: 'Update visa tracking — flag crew member for future routing', owner: 'System', deadline: 'Day 1', critical: false, automatable: true, automationNote: 'Prevents repeat by adjusting crew change port assignments' },
    ]
  },
  {
    id: 'da-failure',
    name: 'D&A Test Failure',
    icon: '⚠️',
    severity: 'critical',
    description: 'Crew member fails drug/alcohol test — immediate removal from vessel, Coast Guard implications, emergency replacement.',
    realExample: 'D&A compliance is managed through Drug Free Vessel consortium. A positive test requires immediate removal, SAP referral, and Coast Guard notification. The system tracks status seamlessly with DFV — we don\'t do the administration, but we make compliance visible.',
    gearsAffected: ['crew-rotation', 'hiring-onboarding', 'training-compliance', 'vessel-schedule'],
    cascadeSteps: [
      { id: 'da1', gear: 'training-compliance', order: 1, timeOffset: 'Hour 0', title: 'Positive Test Result Received', description: 'DFV notifies company of positive result. Crew member status immediately changed to "Removed — D&A." Hard block on all assignments.', impact: 'blocking', triggersNext: ['da2', 'da3'] },
      { id: 'da2', gear: 'crew-rotation', order: 2, timeOffset: 'Hour 0', title: 'Immediate Removal from Vessel', description: 'Crew member must be removed at next port. Emergency crew change initiated — same cascade as medical disembark but with compliance implications.', impact: 'blocking', triggersNext: ['da4'] },
      { id: 'da3', gear: 'training-compliance', order: 2, timeOffset: 'Day 1', title: 'Coast Guard Notification + SAP Referral', description: 'Required regulatory notifications. Substance Abuse Professional (SAP) referral initiated. All tracked in system for audit trail.', impact: 'blocking' },
      { id: 'da4', gear: 'hiring-onboarding', order: 3, timeOffset: 'Day 1', title: 'Emergency Replacement Sourced', description: 'Same emergency sourcing as medical disembark. Position-qualified, all certs current, D&A consortium enrolled, available immediately.', impact: 'blocking', triggersNext: ['da5'] },
      { id: 'da5', gear: 'vessel-schedule', order: 4, timeOffset: 'Day 1-3', title: 'Schedule Impact + Manning Check', description: 'If critical position (licensed officer), vessel may not legally sail. Schedule holds until replacement boards.', impact: 'blocking' },
    ],
    checklist: [
      { id: 'dac1', gear: 'training-compliance', action: 'Update crew D&A status — "Removed: Positive Test"', owner: 'System / HR', deadline: 'Immediately', critical: true, automatable: true, automationNote: 'Auto-updates when DFV result received; hard blocks all assignments' },
      { id: 'dac2', gear: 'crew-rotation', action: 'Initiate immediate removal from vessel', owner: 'Eric / Captain', deadline: 'Next port', critical: true, automatable: false },
      { id: 'dac3', gear: 'crew-rotation', action: 'Arrange repatriation travel for removed crew', owner: 'Sam (Ops)', deadline: 'At removal', critical: true, automatable: false },
      { id: 'dac4', gear: 'training-compliance', action: 'File Coast Guard notification', owner: 'Eric / HR', deadline: 'Within 24 hours', critical: true, automatable: false },
      { id: 'dac5', gear: 'training-compliance', action: 'Initiate SAP referral through DFV', owner: 'HR', deadline: 'Within 48 hours', critical: true, automatable: false },
      { id: 'dac6', gear: 'hiring-onboarding', action: 'Emergency replacement — search relief pool', owner: 'System', deadline: 'Within 4 hours', critical: true, automatable: true, automationNote: 'Same as medical disembark emergency sourcing' },
      { id: 'dac7', gear: 'training-compliance', action: 'Verify all certs for replacement', owner: 'System', deadline: 'Before travel', critical: true, automatable: true, automationNote: 'Hard gate — full cert verification', dependsOn: ['dac6'] },
      { id: 'dac8', gear: 'crew-rotation', action: 'Book emergency travel for replacement', owner: 'System / Lifeline', deadline: 'Within 8 hours', critical: true, automatable: true, automationNote: 'Lifeline handles off-hours booking', dependsOn: ['dac7'] },
      { id: 'dac9', gear: 'vessel-schedule', action: 'Assess manning impact — can vessel sail?', owner: 'System', deadline: 'Within 2 hours', critical: true, automatable: true, automationNote: 'Auto-checks USCG minimum manning' },
      { id: 'dac10', gear: 'training-compliance', action: 'Maintain audit trail for regulatory review', owner: 'System', deadline: 'Ongoing', critical: true, automatable: true, automationNote: 'Full timestamped record of all actions' },
    ]
  },
];

// Real week-over-week data from 5/4 → 5/11 C&G comparison
export const weeklySnapshots: WeeklySnapshot[] = [
  {
    weekDate: '2026-03-02',
    weekLabel: 'Week 1 (Mar 2)',
    vesselCounts: { 'Quest': 45, 'Venture': 42, 'Explorer': 38, 'Resolution': 40 },
    totalCrew: 165,
    changesDetected: [],
    unfilledBillets: 8,
    newHires: 3,
    departures: 2,
  },
  {
    weekDate: '2026-03-09',
    weekLabel: 'Week 2 (Mar 9)',
    vesselCounts: { 'Quest': 46, 'Venture': 41, 'Explorer': 39, 'Resolution': 40 },
    totalCrew: 166,
    changesDetected: [
      { id: 'w2e1', type: 'embark', crewName: 'New Deckhand', vessel: 'Quest', position: 'Deckhand', detail: 'Seasonal hire, embark Seattle' },
      { id: 'w2e2', type: 'disembark', crewName: 'Engineer', vessel: 'Venture', position: 'Engineer/Mechanic', detail: 'Rotation complete, end of hitch' },
    ],
    unfilledBillets: 9,
    newHires: 4,
    departures: 3,
  },
  {
    weekDate: '2026-03-16',
    weekLabel: 'Week 3 (Mar 16)',
    vesselCounts: { 'Quest': 46, 'Venture': 42, 'Explorer': 38, 'Resolution': 41 },
    totalCrew: 167,
    changesDetected: [
      { id: 'w3e1', type: 'termination', crewName: 'AB Seaman', vessel: 'Explorer', position: 'AB', detail: 'Resignation — personal reasons', cascadeTriggered: 'resignation' },
      { id: 'w3e2', type: 'embark', crewName: 'Relief Cook', vessel: 'Resolution', position: 'Cook/Steward', detail: 'Filling temporary gap' },
    ],
    unfilledBillets: 11,
    newHires: 2,
    departures: 4,
  },
  {
    weekDate: '2026-03-23',
    weekLabel: 'Week 4 (Mar 23)',
    vesselCounts: { 'Quest': 47, 'Venture': 42, 'Explorer': 37, 'Resolution': 41 },
    totalCrew: 167,
    changesDetected: [
      { id: 'w4e1', type: 'medical', crewName: 'Chief Steward', vessel: 'Explorer', position: 'Chief Steward', detail: 'Medical disembark — injury on board', cascadeTriggered: 'medical-disembark' },
      { id: 'w4e2', type: 'new-hire', crewName: 'New AB', vessel: 'Explorer', position: 'AB', detail: 'Filling Week 3 resignation gap' },
    ],
    unfilledBillets: 12,
    newHires: 3,
    departures: 2,
  },
  {
    weekDate: '2026-03-30',
    weekLabel: 'Week 5 (Mar 30)',
    vesselCounts: { 'Quest': 47, 'Venture': 43, 'Explorer': 37, 'Resolution': 41 },
    totalCrew: 168,
    changesDetected: [
      { id: 'w5e1', type: 'vessel-transfer', crewName: '2nd Mate', vessel: 'Venture → Quest', position: '2nd Mate', detail: 'Inter-vessel transfer to fill gap' },
      { id: 'w5e2', type: 'status-change', crewName: 'Bosun', vessel: 'Quest', position: 'Bosun', detail: 'STCW BST cert expired — flagged for renewal', cascadeTriggered: 'cert-failure' },
    ],
    unfilledBillets: 13,
    newHires: 2,
    departures: 1,
  },
  // Week 9 = 5/4 actual data
  {
    weekDate: '2026-05-04',
    weekLabel: 'Week 9 (May 4) — Actual',
    vesselCounts: { 'Quest': 48, 'Venture': 43, 'Explorer': 39, 'Resolution': 41 },
    totalCrew: 171,
    changesDetected: [
      { id: 'w9e1', type: 'embark', crewName: '14 crew', vessel: 'Multiple', position: 'Various', detail: '14 embarkations this week across fleet' },
      { id: 'w9e2', type: 'disembark', crewName: '11 crew', vessel: 'Multiple', position: 'Various', detail: '11 disembarkations this week' },
      { id: 'w9e3', type: 'status-change', crewName: 'Multiple', vessel: 'Fleet-wide', position: 'Various', detail: '74 position title variants detected — 27 "Temporary" variants alone' },
    ],
    unfilledBillets: 18,
    newHires: 5,
    departures: 3,
  },
  // Week 10 = 5/11 actual data
  {
    weekDate: '2026-05-11',
    weekLabel: 'Week 10 (May 11) — Actual',
    vesselCounts: { 'Quest': 48, 'Venture': 44, 'Explorer': 39, 'Resolution': 42 },
    totalCrew: 173,
    changesDetected: [
      { id: 'w10e1', type: 'embark', crewName: '16 crew', vessel: 'Multiple', position: 'Various', detail: '16 embarkations — net +2 from last week' },
      { id: 'w10e2', type: 'disembark', crewName: '12 crew', vessel: 'Multiple', position: 'Various', detail: '12 disembarkations' },
      { id: 'w10e3', type: 'status-change', crewName: '38 crew', vessel: 'Fleet-wide', position: 'Various', detail: '38 of 63 upcoming crew changes have NO flights booked — 3 within 7 days', cascadeTriggered: 'missed-flight' },
      { id: 'w10e4', type: 'position-change', crewName: 'Multiple', vessel: 'Fleet-wide', position: 'Various', detail: 'New typos: "Enginer Mechanic", "Seassonal Steward" in production data' },
    ],
    unfilledBillets: 20,
    newHires: 6,
    departures: 4,
  },
];

export const gearNames: Record<string, { name: string; color: string; textColor: string; badgeClass: string }> = {
  'vessel-schedule': { name: 'Vessel Schedule', color: 'bg-info/15', textColor: 'text-info', badgeClass: 'badge-info' },
  'crew-rotation': { name: 'Crew Rotation', color: 'bg-primary/15', textColor: 'text-primary', badgeClass: 'badge-primary' },
  'hiring-onboarding': { name: 'Hiring & Onboarding', color: 'bg-secondary/15', textColor: 'text-secondary', badgeClass: 'badge-secondary' },
  'training-compliance': { name: 'Training & Compliance', color: 'bg-warning/15', textColor: 'text-warning', badgeClass: 'badge-warning' },
};

// ============================================
// REAL HISTORICAL DATA — 9 weeks of C&G reports
// ============================================

export interface RealWeekData {
  date: string;
  label: string;
  embarks: number;
  disembarks: number;
  uniqueCrew: number;
  positions: number;
  noFlight: number;
  gapPositions: number;
  perVessel: Record<string, { embarks: number; disembarks: number; total: number }>;
  unfilledSample: Array<{ vessel: string; position: string; gapDays: number }>;
}

export interface RealDiffData {
  from: string;
  to: string;
  recordsDelta: number;
  newCrewCount: number;
  removedCrewCount: number;
  bookingChanges: number;
  positionChanges: number;
  newCrewSample: string[];
  removedCrewSample: string[];
  bookingSample: Array<{ name: string; field: string; date: string }>;
  positionChangeSample: Array<{ name: string; from: string; to: string }>;
}

export const REAL_WEEKS: RealWeekData[] = [
  {
    "date": "2026-03-13",
    "label": "Week of 03/13",
    "embarks": 520,
    "disembarks": 538,
    "uniqueCrew": 354,
    "positions": 68,
    "noFlight": 203,
    "gapPositions": 19,
    "perVessel": {
      "Quest": {
        "embarks": 158,
        "disembarks": 167,
        "total": 325
      },
      "Sea Bird": {
        "embarks": 86,
        "disembarks": 92,
        "total": 178
      },
      "Sea Lion": {
        "embarks": 96,
        "disembarks": 97,
        "total": 193
      },
      "Venture": {
        "embarks": 180,
        "disembarks": 182,
        "total": 362
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Engine Mechanic",
        "gapDays": 2
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 4",
        "gapDays": 2
      },
      {
        "vessel": "Quest",
        "position": "Rotational Steward",
        "gapDays": 7
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Steward 4",
        "gapDays": 1
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Steward 5",
        "gapDays": 3
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Deckhand",
        "gapDays": 3
      },
      {
        "vessel": "Sea Bird",
        "position": "Rotational Deckhand",
        "gapDays": 6
      },
      {
        "vessel": "Sea Lion",
        "position": "Seasonal Steward 2",
        "gapDays": 3
      }
    ]
  },
  {
    "date": "2026-03-20",
    "label": "Week of 03/20",
    "embarks": 530,
    "disembarks": 545,
    "uniqueCrew": 361,
    "positions": 68,
    "noFlight": 185,
    "gapPositions": 20,
    "perVessel": {
      "Quest": {
        "embarks": 160,
        "disembarks": 170,
        "total": 330
      },
      "Sea Bird": {
        "embarks": 89,
        "disembarks": 94,
        "total": 183
      },
      "Sea Lion": {
        "embarks": 98,
        "disembarks": 97,
        "total": 195
      },
      "Venture": {
        "embarks": 183,
        "disembarks": 184,
        "total": 367
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Engine Mechanic",
        "gapDays": 2
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 4",
        "gapDays": 2
      },
      {
        "vessel": "Quest",
        "position": "Rotational Steward",
        "gapDays": 7
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Steward 4",
        "gapDays": 1
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Steward 5",
        "gapDays": 3
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Deckhand",
        "gapDays": 3
      },
      {
        "vessel": "Sea Bird",
        "position": "Rotational Deckhand",
        "gapDays": 6
      },
      {
        "vessel": "Sea Lion",
        "position": "Seasonal Steward 1",
        "gapDays": 3
      }
    ]
  },
  {
    "date": "2026-03-28",
    "label": "Week of 03/28",
    "embarks": 526,
    "disembarks": 546,
    "uniqueCrew": 361,
    "positions": 70,
    "noFlight": 137,
    "gapPositions": 21,
    "perVessel": {
      "Quest": {
        "embarks": 161,
        "disembarks": 169,
        "total": 330
      },
      "Sea Bird": {
        "embarks": 89,
        "disembarks": 96,
        "total": 185
      },
      "Sea Lion": {
        "embarks": 101,
        "disembarks": 98,
        "total": 199
      },
      "Venture": {
        "embarks": 175,
        "disembarks": 183,
        "total": 358
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Engine Mechanic",
        "gapDays": 2
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 4",
        "gapDays": 2
      },
      {
        "vessel": "Quest",
        "position": "Rotational Steward",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Rotational Laundry Steward",
        "gapDays": 7
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Steward 4",
        "gapDays": 1
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Steward 5",
        "gapDays": 3
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Deckhand",
        "gapDays": 3
      },
      {
        "vessel": "Sea Bird",
        "position": "Rotational Deckhand",
        "gapDays": 6
      }
    ]
  },
  {
    "date": "2026-04-06",
    "label": "Week of 04/06",
    "embarks": 599,
    "disembarks": 612,
    "uniqueCrew": 379,
    "positions": 74,
    "noFlight": 211,
    "gapPositions": 14,
    "perVessel": {
      "Quest": {
        "embarks": 195,
        "disembarks": 198,
        "total": 393
      },
      "Sea Bird": {
        "embarks": 109,
        "disembarks": 114,
        "total": 223
      },
      "Sea Lion": {
        "embarks": 109,
        "disembarks": 108,
        "total": 217
      },
      "Venture": {
        "embarks": 186,
        "disembarks": 192,
        "total": 378
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Head Chef",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Sous Chef",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Line Cook",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Bartender",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Rotational Laundry Steward",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Deckhand 3",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 2",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 8",
        "gapDays": 7
      }
    ]
  },
  {
    "date": "2026-04-13",
    "label": "Week of 04/13",
    "embarks": 619,
    "disembarks": 621,
    "uniqueCrew": 388,
    "positions": 75,
    "noFlight": 209,
    "gapPositions": 18,
    "perVessel": {
      "Quest": {
        "embarks": 198,
        "disembarks": 198,
        "total": 396
      },
      "Sea Bird": {
        "embarks": 117,
        "disembarks": 117,
        "total": 234
      },
      "Sea Lion": {
        "embarks": 114,
        "disembarks": 111,
        "total": 225
      },
      "Venture": {
        "embarks": 190,
        "disembarks": 195,
        "total": 385
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Head Chef",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Chef De Partie",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Line Cook",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Bartender",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Rotational Laundry Steward",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Deckhand 3",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 1",
        "gapDays": 1
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 2",
        "gapDays": 7
      }
    ]
  },
  {
    "date": "2026-04-20",
    "label": "Week of 04/20",
    "embarks": 625,
    "disembarks": 633,
    "uniqueCrew": 386,
    "positions": 75,
    "noFlight": 174,
    "gapPositions": 18,
    "perVessel": {
      "Quest": {
        "embarks": 199,
        "disembarks": 201,
        "total": 400
      },
      "Sea Bird": {
        "embarks": 122,
        "disembarks": 122,
        "total": 244
      },
      "Sea Lion": {
        "embarks": 113,
        "disembarks": 112,
        "total": 225
      },
      "Venture": {
        "embarks": 191,
        "disembarks": 198,
        "total": 389
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Head Chef",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Chef De Partie",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Line Cook",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Bartender",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Rotational Laundry Steward",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Deckhand 3",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 1",
        "gapDays": 1
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 2",
        "gapDays": 7
      }
    ]
  },
  {
    "date": "2026-04-27",
    "label": "Week of 04/27",
    "embarks": 630,
    "disembarks": 636,
    "uniqueCrew": 391,
    "positions": 75,
    "noFlight": 154,
    "gapPositions": 18,
    "perVessel": {
      "Quest": {
        "embarks": 202,
        "disembarks": 203,
        "total": 405
      },
      "Sea Bird": {
        "embarks": 124,
        "disembarks": 124,
        "total": 248
      },
      "Sea Lion": {
        "embarks": 110,
        "disembarks": 112,
        "total": 222
      },
      "Venture": {
        "embarks": 194,
        "disembarks": 197,
        "total": 391
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Head Chef",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Chef De Partie",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Line Cook",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Bartender",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Rotational Laundry Steward",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Deckhand 3",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 1",
        "gapDays": 1
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 2",
        "gapDays": 7
      }
    ]
  },
  {
    "date": "2026-05-04",
    "label": "Week of 05/04",
    "embarks": 696,
    "disembarks": 704,
    "uniqueCrew": 405,
    "positions": 77,
    "noFlight": 245,
    "gapPositions": 18,
    "perVessel": {
      "Quest": {
        "embarks": 215,
        "disembarks": 213,
        "total": 428
      },
      "Sea Bird": {
        "embarks": 131,
        "disembarks": 135,
        "total": 266
      },
      "Sea Lion": {
        "embarks": 126,
        "disembarks": 131,
        "total": 257
      },
      "Venture": {
        "embarks": 224,
        "disembarks": 225,
        "total": 449
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Head Chef",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Chef De Partie",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Line Cook",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Bartender",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Rotational Laundry Steward",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Deckhand 3",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 1",
        "gapDays": 1
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 2",
        "gapDays": 7
      }
    ]
  },
  {
    "date": "2026-05-11",
    "label": "Week of 05/11",
    "embarks": 705,
    "disembarks": 707,
    "uniqueCrew": 411,
    "positions": 77,
    "noFlight": 223,
    "gapPositions": 18,
    "perVessel": {
      "Quest": {
        "embarks": 219,
        "disembarks": 215,
        "total": 434
      },
      "Sea Bird": {
        "embarks": 134,
        "disembarks": 136,
        "total": 270
      },
      "Sea Lion": {
        "embarks": 129,
        "disembarks": 131,
        "total": 260
      },
      "Venture": {
        "embarks": 223,
        "disembarks": 225,
        "total": 448
      }
    },
    "unfilledSample": [
      {
        "vessel": "Quest",
        "position": "Rotational Laundry Steward",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 4",
        "gapDays": 2
      },
      {
        "vessel": "Quest",
        "position": "Seasonal Steward 9",
        "gapDays": 7
      },
      {
        "vessel": "Quest",
        "position": "Engine Mechanic",
        "gapDays": 7
      },
      {
        "vessel": "Sea Bird",
        "position": "Assistant Chef",
        "gapDays": 5
      },
      {
        "vessel": "Sea Bird",
        "position": "Seasonal Steward 5",
        "gapDays": 5
      },
      {
        "vessel": "Sea Bird",
        "position": "Third Mate",
        "gapDays": 7
      },
      {
        "vessel": "Sea Lion",
        "position": "Third Mate",
        "gapDays": 7
      }
    ]
  }
];

export const REAL_DIFFS: RealDiffData[] = [
  {
    "from": "2026-03-13",
    "to": "2026-03-20",
    "recordsDelta": 17,
    "newCrewCount": 10,
    "removedCrewCount": 3,
    "bookingChanges": 36,
    "positionChanges": 4,
    "newCrewSample": [
      "Barry Mille",
      "Barry Miller",
      "Brian Jones",
      "George Coughlin",
      "Henry Van Gieson",
      "Jonathan Wimbley"
    ],
    "removedCrewSample": [
      "Miriam Gomes",
      "Parker Winston",
      "Quinn Kelly"
    ],
    "bookingSample": [
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Erin Martin",
        "field": "hotel",
        "date": "2026-03-21"
      },
      {
        "name": "Christopher Rhodes",
        "field": "flight",
        "date": "2026-03-28"
      },
      {
        "name": "Christopher Rhodes",
        "field": "hotel",
        "date": "2026-03-28"
      },
      {
        "name": "Cameron Dooley",
        "field": "flight",
        "date": "2026-03-21"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Genevieve Spence",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Taylor Brown",
        "from": "Engine Mechanic",
        "to": "Engine Mechanic"
      },
      {
        "name": "Cara Penhaligan",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Eugene Browning",
        "from": "Chief Engineer",
        "to": "Temporary Chief Engineer"
      }
    ]
  },
  {
    "from": "2026-03-20",
    "to": "2026-03-28",
    "recordsDelta": -3,
    "newCrewCount": 5,
    "removedCrewCount": 5,
    "bookingChanges": 53,
    "positionChanges": 6,
    "newCrewSample": [
      "???",
      "Armand Vasquez",
      "Christopher Mills",
      "Mary McBride",
      "Matthew Thomas"
    ],
    "removedCrewSample": [
      "Barry Mille",
      "Caitlin Huter",
      "Gerogia Brown",
      "Katherine McBride",
      "Surfale Abera or Kendra Jones"
    ],
    "bookingSample": [
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Eamon Kennedy",
        "field": "hotel",
        "date": "2026-04-25"
      },
      {
        "name": "Erin Martin",
        "field": "flight",
        "date": "2026-04-17"
      },
      {
        "name": "Barry Miller",
        "field": "flight",
        "date": "2026-03-28"
      },
      {
        "name": "Barry Miller",
        "field": "hotel",
        "date": "2026-03-28"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Thomas Morin Jr.",
        "from": "Captain",
        "to": "Captain / Pilot"
      },
      {
        "name": "Emily Potter",
        "from": "Rotational Deckhand",
        "to": "Temporary Rotational Deckhand"
      },
      {
        "name": "Jairo Rosales",
        "from": "Seasonal Steward",
        "to": "Temporary Assistant Chef"
      },
      {
        "name": "David Menendez",
        "from": "Line Cook",
        "to": "Line Cook"
      },
      {
        "name": "Jayson Cameron",
        "from": "Pantry Chef",
        "to": "Pantry Chef"
      },
      {
        "name": "Desmond Samuels",
        "from": "Senior Deckhand",
        "to": "Rotational Deckhand"
      }
    ]
  },
  {
    "from": "2026-03-28",
    "to": "2026-04-06",
    "recordsDelta": 139,
    "newCrewCount": 23,
    "removedCrewCount": 5,
    "bookingChanges": 39,
    "positionChanges": 10,
    "newCrewSample": [
      "Antoinette Box",
      "Christopher Duran",
      "Colton Kissick",
      "Dave Penchina",
      "Derek Gray",
      "Elliot Lindberg"
    ],
    "removedCrewSample": [
      "???",
      "Addison Terrel",
      "Miriam Gomez",
      "Rose Major",
      "Trey Dutton"
    ],
    "bookingSample": [
      {
        "name": "Janessa Pina Barrientez",
        "field": "flight",
        "date": "2026-04-17"
      },
      {
        "name": "Janessa Pina Barrientez",
        "field": "hotel",
        "date": "2026-04-17"
      },
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Erin Martin",
        "field": "hotel",
        "date": "2026-04-17"
      },
      {
        "name": "Derril Wormley",
        "field": "flight",
        "date": "2026-04-09"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Jeffrey Ijjo",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Carter Davis",
        "from": "Chief Mate",
        "to": "Pilot"
      },
      {
        "name": "Hannah Thompson",
        "from": "Temporary Purser",
        "to": "Temporary Purser"
      },
      {
        "name": "Mary McBride",
        "from": "Hotel Manager",
        "to": "Temporary Hotel Manager"
      },
      {
        "name": "Adam Dressander",
        "from": "Pantry Chef",
        "to": "Pantry Chef"
      },
      {
        "name": "Bridget Fink",
        "from": "Rotational Deckhand",
        "to": "Engine Mechanic"
      }
    ]
  },
  {
    "from": "2026-04-06",
    "to": "2026-04-13",
    "recordsDelta": 29,
    "newCrewCount": 11,
    "removedCrewCount": 2,
    "bookingChanges": 36,
    "positionChanges": 8,
    "newCrewSample": [
      "Allen Brewer III",
      "Annie Vorster",
      "Cara Penhaligen",
      "Isaiah Maniero",
      "John Cox",
      "Lanicia Howard"
    ],
    "removedCrewSample": [
      "Jesus Rodriguez Alameda",
      "Xavier Green"
    ],
    "bookingSample": [
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Yulia Plotnikova",
        "field": "flight",
        "date": "2026-04-13"
      },
      {
        "name": "Yulia Plotnikova",
        "field": "hotel",
        "date": "2026-04-13"
      },
      {
        "name": "Mitchell Fessler",
        "field": "flight",
        "date": "2026-05-16"
      },
      {
        "name": "Elizabeth Feicke",
        "field": "flight",
        "date": "2026-05-10"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Loren Smoot",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Chris Duran",
        "from": "Sous Chef",
        "to": "Chef de Partie"
      },
      {
        "name": "Singyn Hunter",
        "from": "Head Chef",
        "to": "Head Chef Trainer"
      },
      {
        "name": "Derick Wilson",
        "from": "Captain",
        "to": "Pilot"
      },
      {
        "name": "Erasmo Estripeaut",
        "from": "Hotel Manager",
        "to": "Hotel Manager"
      },
      {
        "name": "Derek Gray",
        "from": "Temporary Chef De Partie",
        "to": "Temporary Assistant Chef"
      }
    ]
  },
  {
    "from": "2026-04-13",
    "to": "2026-04-20",
    "recordsDelta": 18,
    "newCrewCount": 1,
    "removedCrewCount": 3,
    "bookingChanges": 67,
    "positionChanges": 5,
    "newCrewSample": [
      "David Sinclair"
    ],
    "removedCrewSample": [
      "Jasmine Peterson",
      "TBD",
      "Tanejah Mayo"
    ],
    "bookingSample": [
      {
        "name": "Matthew Dumas",
        "field": "flight",
        "date": "2026-04-23"
      },
      {
        "name": "Matthew Dumas",
        "field": "hotel",
        "date": "2026-04-23"
      },
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Tiffany Graves",
        "field": "flight",
        "date": "2026-04-30"
      },
      {
        "name": "Brock Johnson",
        "field": "flight",
        "date": "2026-04-27"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Quinn Kelley",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Jacqueline Peterson",
        "from": "Temporary Seasonal Steward",
        "to": "Temporary Seasonal Steward"
      },
      {
        "name": "TBA",
        "from": "Captain",
        "to": "Relief Captain"
      },
      {
        "name": "Singyn Hunter",
        "from": "Head Chef Trainer",
        "to": "Temporary Head Chef"
      },
      {
        "name": "Derick Wilson",
        "from": "Pilot",
        "to": "Captain"
      }
    ]
  },
  {
    "from": "2026-04-20",
    "to": "2026-04-27",
    "recordsDelta": 8,
    "newCrewCount": 7,
    "removedCrewCount": 2,
    "bookingChanges": 40,
    "positionChanges": 3,
    "newCrewSample": [
      "Asa Buckner",
      "Emma Entwistle",
      "Emmanuel Amaefule",
      "Hari Colton",
      "Joan Elly",
      "Naomi Weinflash"
    ],
    "removedCrewSample": [
      "Elliot Lindberg",
      "TBA"
    ],
    "bookingSample": [
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Shannon Earle",
        "field": "hotel",
        "date": "2026-05-23"
      },
      {
        "name": "Kaitlin Coyle",
        "field": "flight",
        "date": "2026-05-16"
      },
      {
        "name": "Daryl Rodriguez",
        "field": "hotel",
        "date": "2026-04-30"
      },
      {
        "name": "Hannah Thompson",
        "field": "flight",
        "date": "2026-05-04"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Jacqueline Peterson",
        "from": "Temporary Seasonal Steward",
        "to": "Temporary Seasonal Steward"
      },
      {
        "name": "Thomas Davis",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Rebecca Behr",
        "from": "Senior Deckhand",
        "to": "Senior Deckhand"
      }
    ]
  },
  {
    "from": "2026-04-27",
    "to": "2026-05-04",
    "recordsDelta": 134,
    "newCrewCount": 17,
    "removedCrewCount": 3,
    "bookingChanges": 68,
    "positionChanges": 7,
    "newCrewSample": [
      "???",
      "Aminah Hamidi",
      "Daniela Vives",
      "Deante Judge",
      "Dominick Cobey",
      "Fred Wilson"
    ],
    "removedCrewSample": [
      "Cara Penhaligen",
      "Matt Thomas",
      "Miguel Yates"
    ],
    "bookingSample": [
      {
        "name": "Kathleen Whitt",
        "field": "hotel",
        "date": "2026-05-31"
      },
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Brock Johnson",
        "field": "hotel",
        "date": "2026-05-24"
      },
      {
        "name": "Carter Davis",
        "field": "flight",
        "date": "2026-05-07"
      },
      {
        "name": "Ignacio Conte",
        "field": "hotel",
        "date": "2026-05-16"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Matthew Thomas",
        "from": "Temporary Second Mate",
        "to": "Temporary Second Mate"
      },
      {
        "name": "Jennifer Rankin",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Jairo Rosales",
        "from": "Temporary Assistant Chef",
        "to": "Temporary Assistant Chef"
      },
      {
        "name": "John Tardiff",
        "from": "Assistant Engineer",
        "to": "Chief Engineer"
      },
      {
        "name": "Treasure Taylor-Matthews",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Mariangeli Perez-Velez",
        "from": "Temporary Purser",
        "to": "Temporary Purser"
      }
    ]
  },
  {
    "from": "2026-05-04",
    "to": "2026-05-11",
    "recordsDelta": 12,
    "newCrewCount": 6,
    "removedCrewCount": 0,
    "bookingChanges": 35,
    "positionChanges": 7,
    "newCrewSample": [
      "Carol Pruitt",
      "Chloe Webb",
      "Darwin Sorrell",
      "Jimmie Miller",
      "Shelby Keller",
      "Tyler Walters"
    ],
    "removedCrewSample": [],
    "bookingSample": [
      {
        "name": "Steven Greber",
        "field": "flight",
        "date": "2025-11-24"
      },
      {
        "name": "Steven Greber",
        "field": "hotel",
        "date": "2025-11-24"
      },
      {
        "name": "Brock Johnson",
        "field": "flight",
        "date": "2026-05-24"
      },
      {
        "name": "JayVaughn Vincent",
        "field": "flight",
        "date": "2026-05-16"
      },
      {
        "name": "Coren Bass",
        "field": "flight",
        "date": "2026-05-16"
      },
      {
        "name": "Joan Elly",
        "field": "flight",
        "date": "2026-05-16"
      }
    ],
    "positionChangeSample": [
      {
        "name": "Dominick Cobey",
        "from": "Seasonal Steward",
        "to": "Seassonal Steward"
      },
      {
        "name": "Naomi Weinflash",
        "from": "Senior Deckhand",
        "to": "Temporary Seasonal Deckhand"
      },
      {
        "name": "Jennifer Rankin",
        "from": "Seasonal Steward",
        "to": "Seasonal Steward"
      },
      {
        "name": "Emma Troutman",
        "from": "Temporary Seasonal Steward",
        "to": "Temporary Seasonal Steward"
      },
      {
        "name": "Cole Michalski",
        "from": "Temporary Seasonal Deckhand",
        "to": "Temporary Seasonal Deckhand"
      },
      {
        "name": "David Young",
        "from": "Chief Engineer",
        "to": "Assistant Engineer"
      }
    ]
  }
];

export const POSITION_ANALYSIS = {
  "totalUnique": 78,
  "variantGroups": {
    "steward": [
      "Temporary Seasonal Steward",
      "Seasonal Steward",
      "Rotational Steward",
      "Temporary Rotational Steward"
    ],
    "bosun": [
      "Bosun",
      "Temporary Bosun"
    ],
    "deckhand": [
      "Temporary Seasonal Deckhand",
      "Temporary Rotational Deckhand",
      "Rotational Deckhand",
      "Seasonal Deckhand"
    ],
    "chief engineer": [
      "Chief Engineer",
      "Temporary Chief Engineer"
    ],
    "asst. engineer": [
      "Temporary Asst. Engineer",
      "Asst. Engineer"
    ],
    "engine mechanic": [
      "Temporary Engine Mechanic",
      "Engine Mechanic"
    ],
    "purser": [
      "Purser",
      "Temporary Purser"
    ],
    "hotel manager": [
      "Hotel Manager",
      "Temporary Hotel Manager"
    ],
    "pantry chef": [
      "Pantry Chef",
      "Temporary Pantry Chef"
    ],
    "third mate": [
      "Third Mate",
      "Temporary Third Mate"
    ],
    "sous chef": [
      "Temporary Sous Chef",
      "Sous Chef"
    ],
    "head chef": [
      "Temporary Head Chef",
      "Head Chef"
    ],
    "chef de partie": [
      "Chef de Partie",
      "Chef De Partie",
      "Temporary Chef De Partie"
    ],
    "pastry chef": [
      "Pastry Chef",
      "Temporary Pastry Chef"
    ],
    "bartender": [
      "Bartender",
      "Temporary Bartender"
    ],
    "chief steward": [
      "Temporary Chief Steward",
      "Chief Steward"
    ],
    "assistant engineer": [
      "Assistant Engineer",
      "Temporary Assistant Engineer"
    ],
    "galley steward": [
      "Temporary Galley Steward",
      "Galley Steward"
    ],
    "second mate": [
      "Temporary Second Mate",
      "Second Mate"
    ],
    "laundry steward": [
      "Temporary Rotational Laundry Steward",
      "Rotational Laundry Steward",
      "Laundry Steward"
    ],
    "senior steward": [
      "Senior Steward",
      "Temporary Senior Steward",
      "Rotational Senior Steward"
    ],
    "assistant chef": [
      "Temporary Assistant Chef",
      "Assistant Chef"
    ]
  },
  "top20": {
    "Seasonal Steward": 1639,
    "Rotational Deckhand": 622,
    "Engine Mechanic": 525,
    "Seasonal Deckhand": 496,
    "Hotel Manager": 450,
    "Bartender": 424,
    "Chief Mate": 414,
    "Captain": 392,
    "Third Mate": 367,
    "Pantry Chef": 335,
    "Chief Engineer": 331,
    "Bosun": 326,
    "Purser": 318,
    "Head Chef": 311,
    "Chief Steward": 292,
    "Second Mate": 278,
    "Rotational Steward": 277,
    "Temporary Seasonal Steward": 266,
    "Assistant Engineer": 228,
    "Assistant Chef": 167
  }
};

export const FLEET_SUMMARY = {
  "total_unique_crew": 433,
  "weeks_analyzed": 9,
  "date_range": "2026-03-13 to 2026-05-11"
};
