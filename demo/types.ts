export type Position = 'Captain' | 'Chief Mate' | 'Third Mate' | 'Deckhand' | 'Engineer';
export type Department = 'Deck' | 'Engine';
export type CrewStatus = 'on_board' | 'on_leave' | 'in_transit' | 'available';
export type CredentialStatus = 'valid' | 'expiring_soon' | 'expired';
export type TravelStatus = 'not_needed' | 'needs_booking' | 'booked' | 'in_transit' | 'arrived' | 'cancelled' | 'rebooking';
export type VoyageStatus = 'planning' | 'active' | 'completed';
export type WatchPattern = '4on8off' | '6on6off';
export type CrewChangeStatus = 'scheduled' | 'travel_booked' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';

export interface Credential {
  name: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  status: CredentialStatus;
}

export interface CrewMember {
  id: string;
  name: string;
  position: Position;
  department: Department;
  status: CrewStatus;
  homeAirport: string;
  credentials: Credential[];
  phone: string;
  email: string;
  seaDays: number;
  rotationWeeks: number; // weeks on / weeks off
}

export interface Voyage {
  id: string;
  name: string;
  departure: string;
  arrival: string;
  departureDate: string;
  arrivalDate: string;
  status: VoyageStatus;
  distance: string;
  waypoints: string[];
}

export interface WatchEntry {
  watch: string;
  time: string;
  officer: string;
  crew: string[];
  notes: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  flight: string;
  depart: string;
  arrive: string;
  departTime: string;
  arriveTime: string;
  price: number;
  fareType: string;
  stops: number;
}

export interface CrewChange {
  id: string;
  status: CrewChangeStatus;
  offgoing: CrewMember;
  oncoming: CrewMember;
  port: string;
  date: string;
  flight?: FlightOption;
  travelStatus: TravelStatus;
  notes: string[];
  history: { time: string; event: string }[];
}

export type CostEventType = 'booking' | 'change' | 'refund' | 'cancellation' | 'rebooking';
export type RefundStatus = 'not_applicable' | 'pending' | 'processing' | 'credited' | 'denied';
export type ApprovalStatus = 'auto_approved' | 'pending_approval' | 'approved' | 'rejected';

export interface CostEvent {
  id: string;
  date: string;
  type: CostEventType;
  crewMemberId: string;
  crewMemberName: string;
  voyageId: string;
  voyageName: string;
  description: string;
  vendor: string;
  originalAmount: number;
  newAmount: number;
  delta: number; // positive = additional cost, negative = savings/refund
  refundStatus: RefundStatus;
  refundAmount: number;
  approvedBy: string;
  approvalStatus: ApprovalStatus;
  reason: string;
  relatedEventId?: string; // links change to original booking
  notes: string;
  pnr?: string; // booking reference
  flightInfo?: string;
}

export interface CostSummary {
  voyageId: string;
  voyageName: string;
  totalBooked: number;
  totalChangeFees: number;
  totalRefundsPending: number;
  totalRefundsCredited: number;
  netCost: number;
  eventCount: number;
}

export type DemoTab = 'vessel' | 'crew' | 'voyage' | 'watch' | 'crewchange' | 'changes' | 'travel';

// ── Travel Sub-tabs ──
export type TravelSubTab = 'search' | 'logistics' | 'packets' | 'visas';

// ── Logistics Tags ──
export type LogisticsTagType =
  | 'traveling_together'  // shared itinerary with another crew member
  | 'first_arrival'       // first time at this port, needs extra guidance
  | 'rental_vehicle'      // has rental car, can transport others
  | 'rider'               // riding with a rental_vehicle crew member
  | 'rest_required'       // STCW rest before watch (long-haul flight)
  | 'heavy_gear'          // tools/equipment affecting transport
  | 'inter_vessel'        // transferring from another Standing Tide vessel
  | 'comms_needed'        // needs local SIM or sat phone
  | 'return_booked'       // round-trip already booked
  | 'priority_arrival';   // must arrive first (captain for handover)

export interface LogisticsTag {
  type: LogisticsTagType;
  label: string;
  icon: string;
  detail?: string;       // e.g., "Traveling with Andy Brooks"
  linkedCrewId?: string;  // e.g., who they're traveling with or riding with
}

export interface HotelAssignment {
  hotelName: string;
  address: string;
  confirmationNumber: string;
  checkIn: string;
  checkOut: string;
  nightlyRate: number;
  notes?: string;
}

export interface GroundTransport {
  type: 'rental' | 'taxi' | 'rideshare' | 'port_agent' | 'crew_vehicle';
  provider?: string;
  confirmationNumber?: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  cost: number;
  capacity?: number;      // how many crew can ride
  assignedCrew: string[]; // crew member IDs riding this vehicle
}

export interface CrewLogisticsPlan {
  crewMemberId: string;
  crewMemberName: string;
  position: string;
  tags: LogisticsTag[];
  hotel?: HotelAssignment;
  groundTransport?: GroundTransport;
  arrivalTime: string;
  pickupSequence: number;  // 1 = first pickup
  watchEligibleTime?: string; // STCW rest calc — when they can stand watch
  notes: string;
}

// ── Travel Packets ──
export type PacketStatus = 'draft' | 'sent' | 'updated' | 'acknowledged';
export type PacketChannel = 'sms' | 'email' | 'both';

export interface TravelPacket {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  position: string;
  status: PacketStatus;
  channel: PacketChannel;
  sentAt?: string;
  acknowledgedAt?: string;
  version: number;
  sections: {
    flights: boolean;
    hotel: boolean;
    groundTransport: boolean;
    portInfo: boolean;
    vesselBerth: boolean;
    emergencyContacts: boolean;
    visaInfo: boolean;
    pickupInstructions: boolean;
  };
  changes?: { field: string; oldValue: string; newValue: string }[];
}

// ── Visa Tracker ──
export type VisaStatus = 'not_required' | 'not_started' | 'documents_gathering' | 'submitted' | 'processing' | 'approved' | 'denied' | 'expired';

export interface VisaDocument {
  name: string;
  required: boolean;
  collected: boolean;
  notes?: string;
}

export interface VisaRequest {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  nationality: string;
  destinationCountry: string;
  destinationPort: string;
  visaType: string; // e.g., "Crew Transit", "Seaman's Visa", "C-1/D"
  status: VisaStatus;
  documents: VisaDocument[];
  submittedDate?: string;
  approvedDate?: string;
  expiryDate?: string;
  processingDays: number;    // average processing time
  crewChangeDate: string;     // when they need to be there
  daysUntilCrewChange: number;
  portAgent?: string;
  portAgentContact?: string;
  notes: string;
  urgency: 'normal' | 'urgent' | 'critical'; // based on time remaining vs processing time
}

export interface TravelSearchCriteria {
  crewMemberId: string;
  crewMemberName: string;
  position: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  originAirports: string[];
  destinationAirports: string[];
  maxBudget: number | null;
  maxStops: number;
  arriveBy: 'day_before' | 'morning_of' | 'anytime';
  fareType: 'any' | 'refundable' | 'marine';
}

export interface TravelOption {
  id: string;
  airline: string;
  flightNumbers: string[];
  originAirport: string;
  destinationAirport: string;
  departDate: string;
  departTime: string;
  arriveDate: string;
  arriveTime: string;
  stops: number;
  layoverInfo?: string;
  travelTimeMinutes: number;
  flightCost: number;
  fareClass: string;
  refundable: boolean;
  marineFare: boolean;
  hotelNeeded: boolean;
  hotelCost: number;
  groundTransportCost: number;
  totalCost: number;
  tags: ('best_value' | 'fastest' | 'most_flexible' | 'direct' | 'budget' | 'marine')[];
}
