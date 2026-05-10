export interface Vessel {
  name: string;
  shortName: string;
  type: string;
  billetCount: number;
  currentCrew: number;
  unfilledBillets: number;
  status: 'operational' | 'repositioning' | 'wet_dock' | 'layup';
  currentLocation: string;
  nextPort: string;
  departments: Department[];
}

export interface Department {
  name: string;
  positions: string[];
  filled: number;
  total: number;
}

export interface CrewMember {
  name: string;
  positions: string[];
  vessels: string[];
  events: CrewEvent[];
  multiVessel: boolean;
}

export interface CrewEvent {
  date: string;
  type: 'embark' | 'disembark';
  vessel: string;
  position: string;
  port: string | null;
}

export interface CrewChange {
  date: string;
  location: string | null;
  type: 'embark' | 'disembark';
  name: string;
  position: string;
  flightBooked: boolean;
  hotelBooked: boolean;
  visa?: boolean | null;
  notes: string | null;
}

export interface UnfilledWeek {
  week: string;
  quest: number;
  seaBird: number;
  seaLion: number;
  venture: number;
  total: number;
}

export interface BilletGap {
  vessel: string;
  position: string;
  days: number;
  notes: string;
}

export type TabId = 'fleet' | 'changes' | 'billets' | 'roster' | 'report';
