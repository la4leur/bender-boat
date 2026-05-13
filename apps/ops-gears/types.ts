export type GearId = 'vessel-schedule' | 'crew-rotation' | 'hiring-onboarding' | 'training-compliance';

export interface Stage {
  id: string;
  name: string;
  description: string;
  duration?: string;
  owner?: string;
  painPoints?: string[];
  automationNote?: string;
  gate?: boolean;
  substages?: SubStage[];
}

export interface SubStage {
  id: string;
  name: string;
  description: string;
  duration?: string;
  gate?: boolean;
}

export interface GearProcess {
  id: GearId;
  name: string;
  shortName: string;
  tagline: string;
  stages: Stage[];
  inputs: string[];
  outputs: string[];
}

export interface MeshPoint {
  fromGear: GearId;
  toGear: GearId;
  label: string;
  trigger: string;
  dataFlow: string[];
}

export interface ScenarioStep {
  dayOffset: number;
  gear: GearId;
  stageId: string;
  title: string;
  description: string;
  highlight?: 'success' | 'warning' | 'error' | 'info';
}

export type ViewMode = 'system' | 'pipeline' | 'scenario';
