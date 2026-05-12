export type GearId = 'vessel-schedule' | 'crew-rotation' | 'hiring-onboarding' | 'training-compliance';

export interface DisruptionType {
  id: string;
  name: string;
  icon: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  realExample: string;
  gearsAffected: GearId[];
  cascadeSteps: CascadeStep[];
  checklist: ChecklistItem[];
}

export interface CascadeStep {
  id: string;
  gear: GearId;
  order: number;
  timeOffset: string;
  title: string;
  description: string;
  impact: 'blocking' | 'degraded' | 'awareness';
  triggersNext?: string[];
}

export interface ChecklistItem {
  id: string;
  gear: GearId;
  action: string;
  owner: string;
  deadline: string;
  dependsOn?: string[];
  critical: boolean;
  automatable: boolean;
  automationNote?: string;
}

export interface WeeklySnapshot {
  weekDate: string;
  weekLabel: string;
  vesselCounts: Record<string, number>;
  totalCrew: number;
  changesDetected: ChangeEvent[];
  unfilledBillets: number;
  newHires: number;
  departures: number;
}

export interface ChangeEvent {
  id: string;
  type: 'embark' | 'disembark' | 'position-change' | 'vessel-transfer' | 'status-change' | 'new-hire' | 'termination' | 'medical';
  crewName: string;
  vessel: string;
  position: string;
  detail: string;
  cascadeTriggered?: string;
}

export type ViewType = 'catalog' | 'cascade' | 'checklist' | 'replay';
