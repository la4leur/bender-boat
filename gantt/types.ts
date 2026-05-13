export type Phase = 'v1' | 'v1.5' | 'v2';

export interface Task {
  id: string;
  name: string;
  phase: Phase;
  startWeek: number;
  endWeek: number;
  category: string;
  description: string;
  dependencies?: string[];
  milestone?: boolean;
  milestoneLabel?: string;
  team?: string;
  confidence: number; // 1-10
  referenceFrom?: string; // e.g., "Ferry Log" if code is reusable
}

export interface Milestone {
  id: string;
  label: string;
  week: number;
  phase: Phase;
}
