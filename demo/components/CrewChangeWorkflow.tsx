import React, { useState } from 'react';
import {
  ArrowRightLeft, Plane, CheckCircle, AlertTriangle, Clock, DollarSign,
  XCircle, RefreshCw, UserCheck, Shield, ChevronRight, RotateCcw
} from 'lucide-react';
import { CrewChange, FlightOption, CrewChangeStatus, TravelStatus } from '../types';
import { initialCrewChange, flightOptions, rebookOptions, reliefCrew, currentCrew } from '../data';

type DemoStep = 'init' | 'booked' | 'delayed' | 'rebooked' | 'cancelled' | 'replacement';

const StatusBadge: React.FC<{ status: CrewChangeStatus }> = ({ status }) => {
  const map: Record<CrewChangeStatus, { cls: string; label: string }> = {
    scheduled: { cls: 'badge-info', label: 'Scheduled' },
    travel_booked: { cls: 'badge-success', label: 'Travel Booked' },
    in_progress: { cls: 'badge-warning', label: 'In Progress' },
    completed: { cls: 'badge-success', label: 'Completed' },
    cancelled: { cls: 'badge-error', label: 'Cancelled' },
    delayed: { cls: 'badge-warning', label: 'Delayed' },
  };
  const s = map[status];
  return <span className={`badge ${s.cls} badge-sm`}>{s.label}</span>;
};

const TravelBadge: React.FC<{ status: TravelStatus }> = ({ status }) => {
  const map: Record<TravelStatus, { cls: string; label: string }> = {
    not_needed: { cls: 'badge-ghost', label: 'Not Needed' },
    needs_booking: { cls: 'badge-warning', label: 'Needs Booking' },
    booked: { cls: 'badge-success', label: 'Booked' },
    in_transit: { cls: 'badge-info', label: 'In Transit' },
    arrived: { cls: 'badge-success', label: 'Arrived' },
    cancelled: { cls: 'badge-error', label: 'Cancelled' },
    rebooking: { cls: 'badge-warning', label: 'Rebooking' },
  };
  const s = map[status];
  return <span className={`badge ${s.cls} badge-xs`}>{s.label}</span>;
};

const FlightCard: React.FC<{ flight: FlightOption; onSelect?: (f: FlightOption) => void; selected?: boolean }> = ({ flight, onSelect, selected }) => (
  <div
    className={`card ${selected ? 'bg-success/10 border border-success/30' : 'bg-base-300'} ${onSelect ? 'cursor-pointer hover:bg-base-100 transition-colors' : ''}`}
    onClick={() => onSelect?.(flight)}
  >
    <div className="card-body p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plane size={16} className="text-info" />
          <div>
            <div className="font-semibold text-sm">{flight.airline} {flight.flight}</div>
            <div className="text-xs text-base-content/60">{flight.depart} → {flight.arrive}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-sm">${flight.price}</div>
          <div className="badge badge-xs badge-info">{flight.fareType}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-base-content/60">
        <span>{flight.departTime} → {flight.arriveTime}</span>
        <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</span>
      </div>
      {selected && (
        <div className="flex items-center gap-1 mt-1 text-xs text-success">
          <CheckCircle size={12} /> Selected
        </div>
      )}
    </div>
  </div>
);

export const CrewChangeWorkflow: React.FC<{}> = () => {
  const [step, setStep] = useState<DemoStep>('init');
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null);
  const [selectedRebook, setSelectedRebook] = useState<FlightOption | null>(null);
  const [history, setHistory] = useState(initialCrewChange.history);

  const addHistory = (event: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setHistory(prev => [...prev, { time: now, event }]);
  };

  const handleBookFlight = (f: FlightOption) => {
    setSelectedFlight(f);
    setStep('booked');
    addHistory(`Flight booked: ${f.airline} ${f.flight} (${f.depart}→${f.arrive}) — $${f.price} ${f.fareType}`);
    addHistory('Travel status updated: Booked ✓');
    addHistory(`Confirmation sent to Lisa Chen (lchen@standingtide.com)`);
  };

  const handleDelay = () => {
    setStep('delayed');
    addHistory('⚠ VOYAGE DELAYED — Arrival pushed to May 19 due to weather');
    addHistory(`Original crew change date May 17 → May 19`);
    addHistory(`Flight ${selectedFlight?.airline} ${selectedFlight?.flight} on May 16 needs rebooking`);
    addHistory('Travel status: Rebooking Required');
  };

  const handleRebook = (f: FlightOption) => {
    setSelectedRebook(f);
    setStep('rebooked');
    const refund = selectedFlight ? selectedFlight.price : 0;
    const delta = f.price - refund;
    addHistory(`Original flight cancelled — refund of $${refund} ${delta >= 0 ? 'pending' : 'processed'}`);
    addHistory(`Rebooked: ${f.airline} ${f.flight} (${f.depart}→${f.arrive}) — $${f.price} ${f.fareType}`);
    addHistory(`Cost delta: ${delta >= 0 ? '+' : ''}$${delta}`);
    addHistory('Rebooking confirmation sent to Lisa Chen');
  };

  const handleCancel = () => {
    setStep('cancelled');
    addHistory('❌ Lisa Chen crew change CANCELLED — medical issue reported');
    addHistory(`Flight cancellation initiated — refund: $${selectedRebook?.price ?? selectedFlight?.price ?? 0} (marine fare refund policy: full refund)`);
    addHistory('Position Chief Mate now UNFILLED for May 19 crew change');
    addHistory('System scanning relief pool for qualified replacements...');
  };

  const handleReplacement = () => {
    setStep('replacement');
    addHistory('Andy Brooks (3/M) identified — credentials check: Chief Mate 1600 GRT ✗ — NOT QUALIFIED');
    addHistory('Dave Winters (CPT) identified — overqualified but available — QUALIFIED ✓');
    addHistory('⚠ No direct Chief Mate relief available in pool');
    addHistory('OPTION: Promote Tom Halverson (3/M on board) to acting C/M, bring in Andy Brooks as 3/M relief');
    addHistory('Andy Brooks credentials for Third Mate: VERIFIED ✓');
  };

  const handleReset = () => {
    setStep('init');
    setSelectedFlight(null);
    setSelectedRebook(null);
    setHistory(initialCrewChange.history);
  };

  const currentStatus: CrewChangeStatus = step === 'init' ? 'scheduled'
    : step === 'booked' ? 'travel_booked'
    : step === 'delayed' || step === 'rebooked' ? 'delayed'
    : 'cancelled';

  const currentTravel: TravelStatus = step === 'init' ? 'needs_booking'
    : step === 'booked' ? 'booked'
    : step === 'delayed' ? 'rebooking'
    : step === 'rebooked' ? 'booked'
    : 'cancelled';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowRightLeft size={20} className="text-primary" />
          <div>
            <div className="font-semibold">Crew Change — Chief Mate</div>
            <div className="text-xs text-base-content/60">Hamilton, Bermuda • {step === 'delayed' || step === 'rebooked' ? 'May 19' : 'May 17'}, 2026</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />
          <button className="btn btn-ghost btn-xs" onClick={handleReset} title="Reset demo">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Crew Change Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-error/10 border border-error/20">
          <div className="card-body p-3">
            <div className="text-xs text-error uppercase font-semibold tracking-wider mb-1">Offgoing</div>
            <div className="font-semibold">{initialCrewChange.offgoing.name}</div>
            <div className="text-xs text-base-content/60">Chief Mate • 6-week hitch complete</div>
            <div className="text-xs text-base-content/60">→ Home: {initialCrewChange.offgoing.homeAirport}</div>
          </div>
        </div>
        <div className="card bg-success/10 border border-success/20">
          <div className="card-body p-3">
            <div className="text-xs text-success uppercase font-semibold tracking-wider mb-1">Oncoming</div>
            <div className="font-semibold">{step === 'cancelled' || step === 'replacement' ? '— TBD —' : initialCrewChange.oncoming.name}</div>
            <div className="text-xs text-base-content/60">Chief Mate • Starting 6-week hitch</div>
            <div className="text-xs text-base-content/60">← Home: {initialCrewChange.oncoming.homeAirport}</div>
            <div className="mt-1 flex items-center gap-1">
              <Shield size={12} className="text-success" />
              <span className="text-xs text-success">All credentials verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Status */}
      <div className="card bg-base-200">
        <div className="card-body p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Plane size={16} className="opacity-60" />
              <span className="font-semibold text-sm">Travel</span>
            </div>
            <TravelBadge status={currentTravel} />
          </div>

          {/* Step: Initial — Show flight options */}
          {step === 'init' && (
            <div className="space-y-2">
              <div className="text-xs text-base-content/60 mb-2">
                Lisa Chen needs to fly from <span className="font-semibold">SFO → BDA</span> to arrive by May 17. Select a flight:
              </div>
              {flightOptions.map(f => (
                <FlightCard key={f.id} flight={f} onSelect={handleBookFlight} />
              ))}
            </div>
          )}

          {/* Step: Booked — Show confirmation */}
          {step === 'booked' && selectedFlight && (
            <div className="space-y-3">
              <FlightCard flight={selectedFlight} selected />
              <div className="flex gap-2">
                <button className="btn btn-warning btn-sm flex-1 gap-1" onClick={handleDelay}>
                  <AlertTriangle size={14} /> Simulate Voyage Delay
                </button>
              </div>
              <div className="text-xs text-base-content/60">
                ↑ Click to see how the system handles a voyage delay affecting crew travel
              </div>
            </div>
          )}

          {/* Step: Delayed — Show rebooking options */}
          {step === 'delayed' && (
            <div className="space-y-2">
              <div className="alert alert-warning p-2 text-xs">
                <AlertTriangle size={14} />
                <span>Voyage delayed 2 days. Original flight on May 16 is too early. Rebooking required for May 18.</span>
              </div>
              <div className="text-xs font-semibold mt-2">Available Rebooking Options:</div>
              {rebookOptions.map(f => (
                <FlightCard key={f.id} flight={f} onSelect={handleRebook} />
              ))}
              {selectedFlight && (
                <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1">
                  <DollarSign size={12} />
                  Original booking: ${selectedFlight.price} — refund will be applied to new booking
                </div>
              )}
            </div>
          )}

          {/* Step: Rebooked — Show new confirmation + cancel option */}
          {step === 'rebooked' && selectedRebook && (
            <div className="space-y-3">
              <div className="alert alert-success p-2 text-xs">
                <CheckCircle size={14} />
                <span>Successfully rebooked. Cost delta handled automatically.</span>
              </div>
              <FlightCard flight={selectedRebook} selected />
              {selectedFlight && (
                <div className="bg-base-300 rounded p-2 text-xs space-y-1">
                  <div className="flex justify-between"><span>Original booking:</span><span>${selectedFlight.price}</span></div>
                  <div className="flex justify-between"><span>Refund applied:</span><span className="text-success">-${selectedFlight.price}</span></div>
                  <div className="flex justify-between"><span>New booking:</span><span>${selectedRebook.price}</span></div>
                  <div className="border-t border-base-100 pt-1 flex justify-between font-semibold">
                    <span>Net cost:</span><span>${selectedRebook.price - selectedFlight.price >= 0 ? '+' : ''}${selectedRebook.price - selectedFlight.price}</span>
                  </div>
                </div>
              )}
              <button className="btn btn-error btn-sm w-full gap-1" onClick={handleCancel}>
                <XCircle size={14} /> Simulate Crew Cancellation
              </button>
              <div className="text-xs text-base-content/60">
                ↑ Lisa Chen has a medical issue and can't make the crew change
              </div>
            </div>
          )}

          {/* Step: Cancelled — Show refund + replacement needed */}
          {step === 'cancelled' && (
            <div className="space-y-3">
              <div className="alert alert-error p-2 text-xs">
                <XCircle size={14} />
                <span>Crew change cancelled. Travel refund initiated.</span>
              </div>
              <div className="bg-base-300 rounded p-2 text-xs space-y-1">
                <div className="font-semibold mb-1">Refund Summary</div>
                <div className="flex justify-between"><span>Cancelled flight:</span><span>{selectedRebook?.airline} {selectedRebook?.flight}</span></div>
                <div className="flex justify-between"><span>Fare type:</span><span>{selectedRebook?.fareType}</span></div>
                <div className="flex justify-between"><span>Refund amount:</span><span className="text-success">${selectedRebook?.price}</span></div>
                <div className="flex justify-between"><span>Refund policy:</span><span>Marine fare — full refund</span></div>
                <div className="flex justify-between"><span>Status:</span><span className="badge badge-warning badge-xs">Processing</span></div>
              </div>
              <button className="btn btn-primary btn-sm w-full gap-1" onClick={handleReplacement}>
                <UserCheck size={14} /> Find Replacement Crew
              </button>
            </div>
          )}

          {/* Step: Replacement — Show credential-based search */}
          {step === 'replacement' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold">Relief Pool — Chief Mate Qualified:</div>
              <div className="alert alert-warning p-2 text-xs">
                <AlertTriangle size={14} />
                <span>No direct Chief Mate relief available. System suggests operational workaround.</span>
              </div>

              <div className="card bg-base-300">
                <div className="card-body p-3">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle size={14} className="text-success" /> Recommended: Internal Promotion + Relief
                  </div>
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-primary mt-0.5" />
                      <div>
                        <span className="font-semibold">Promote Tom Halverson</span> (3/M on board) to Acting Chief Mate
                        <div className="text-base-content/60 mt-0.5">Credentials: Third Mate Unlimited — eligible for C/M duties under Master's authority</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-primary mt-0.5" />
                      <div>
                        <span className="font-semibold">Bring in Andy Brooks</span> as Third Mate relief
                        <div className="text-base-content/60 mt-0.5">Credentials: Third Mate Unlimited ✓ • STCW ✓ • TWIC ✓ • Medical ✓ — FULLY QUALIFIED</div>
                        <div className="text-base-content/60">Home airport: ATL • Needs flight ATL → BDA</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn btn-success btn-xs flex-1 gap-1"><CheckCircle size={12} /> Approve & Book</button>
                    <button className="btn btn-ghost btn-xs" onClick={handleReset}><RotateCcw size={12} /> Reset Demo</button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-base-content/60">
                Every step above is tracked in the audit trail below. The system never lets you assign someone who isn't qualified — the credential check runs automatically.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Clock size={16} className="opacity-60" /> Audit Trail
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-base-content/40 font-mono whitespace-nowrap">{h.time.slice(5)}</span>
                <span className={h.event.includes('⚠') ? 'text-warning' : h.event.includes('❌') ? 'text-error' : h.event.includes('✓') ? 'text-success' : 'text-base-content/80'}>{h.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Guide */}
      <div className="card bg-primary/5 border border-primary/20">
        <div className="card-body p-3">
          <div className="text-xs font-semibold text-primary mb-1">Demo Flow Guide</div>
          <ol className="text-xs text-base-content/70 space-y-0.5 list-decimal list-inside">
            <li className={step === 'init' ? 'font-semibold text-base-content' : ''}>Select a flight to book travel for the incoming crew member</li>
            <li className={step === 'booked' ? 'font-semibold text-base-content' : ''}>Simulate a voyage delay — see how travel is automatically flagged</li>
            <li className={step === 'delayed' ? 'font-semibold text-base-content' : ''}>Rebook the flight — refund math handled automatically</li>
            <li className={step === 'rebooked' ? 'font-semibold text-base-content' : ''}>Simulate a crew cancellation — refund initiated, replacement search triggered</li>
            <li className={step === 'cancelled' || step === 'replacement' ? 'font-semibold text-base-content' : ''}>System finds qualified replacement using credential matrix</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
