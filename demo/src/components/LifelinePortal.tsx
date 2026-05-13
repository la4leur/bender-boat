import React, { useState } from 'react';
import {
  AlertTriangle, Phone, MapPin, Plane, Clock, Shield, CheckCircle, XCircle,
  UserCheck, DollarSign, BarChart3, Eye, Smartphone, Headphones, Users,
  ChevronRight, Send, ArrowRight, Bell, Radio
} from 'lucide-react';
import { LifelineIncident, LifelineReasonCode, LifelineStatus, LifelineFaultType } from '../types';
import { lifelineIncidents, lifelineCrewRecords } from '../data';

type LifelineView = 'crew' | 'coordinator' | 'accountability' | 'guardrails';

const reasonOptions: { code: LifelineReasonCode; label: string; icon: string }[] = [
  { code: 'missed_overslept', label: 'Overslept / Alarm Failure', icon: '😴' },
  { code: 'missed_traffic', label: 'Traffic / Ground Transport', icon: '🚗' },
  { code: 'missed_luggage', label: 'Luggage Issue', icon: '🧳' },
  { code: 'missed_other', label: 'Other (Crew Fault)', icon: '❓' },
  { code: 'airline_cancelled', label: 'Flight Cancelled by Airline', icon: '✈️' },
  { code: 'airline_delay_missed_connection', label: 'Delay / Missed Connection', icon: '⏱️' },
  { code: 'medical', label: 'Medical Emergency', icon: '🏥' },
  { code: 'other_emergency', label: 'Other Emergency', icon: '🆘' },
];

const statusColors: Record<LifelineStatus, string> = {
  submitted: 'badge-warning',
  reviewing: 'badge-info',
  authorized: 'badge-accent',
  rebooked: 'badge-primary',
  resolved: 'badge-success',
  denied: 'badge-error',
};

const faultColors: Record<LifelineFaultType, string> = {
  crew_fault: 'badge-error',
  airline_fault: 'badge-warning',
  external: 'badge-info',
  pending_review: 'badge-ghost',
};

const faultLabels: Record<LifelineFaultType, string> = {
  crew_fault: 'Crew Fault',
  airline_fault: 'Airline Fault',
  external: 'External',
  pending_review: 'Pending Review',
};

function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  if (n < 0) return `-${formatted}`;
  return formatted;
}

// ── Crew Portal View (Phone Mockup) ──
const CrewPortalView: React.FC = () => {
  const [step, setStep] = useState<'ready' | 'form' | 'submitted'>('ready');
  const [selectedReason, setSelectedReason] = useState<LifelineReasonCode>('missed_luggage');
  const incident = lifelineIncidents[0]; // Marcus Webb's active incident

  return (
    <div className="flex flex-col items-center py-6">
      <div className="text-sm text-base-content/50 mb-3 flex items-center gap-2">
        <Smartphone size={14} /> Crew member's phone view
      </div>
      {/* Phone mockup frame */}
      <div className="w-full max-w-[375px] border-4 border-base-300 rounded-3xl shadow-2xl bg-base-100 overflow-hidden">
        {/* Phone status bar */}
        <div className="bg-base-300 px-4 py-1.5 flex justify-between items-center text-xs text-base-content/60">
          <span>9:41 AM</span>
          <span className="font-semibold text-base-content/80">Standing Tide</span>
          <span>📶 🔋</span>
        </div>

        <div className="p-4 min-h-[520px] flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-2xl mb-1">🚨</div>
            <h2 className="font-bold text-lg">Emergency Travel Assistance</h2>
            <p className="text-xs text-base-content/50 mt-1">M/V HATCHLING — Crew Portal</p>
          </div>

          {step === 'ready' && (
            <>
              {/* Current travel info */}
              <div className="bg-base-200 rounded-xl p-3 mb-4">
                <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-2">Your Current Booking</div>
                <div className="flex items-center gap-2 mb-1">
                  <Plane size={14} className="text-primary" />
                  <span className="font-semibold text-sm">{incident.originalFlight.airline} {incident.originalFlight.flight}</span>
                </div>
                <div className="text-sm text-base-content/70 ml-6">{incident.originalFlight.route}</div>
                <div className="text-sm text-base-content/70 ml-6 flex items-center gap-1">
                  <Clock size={12} /> Departs 6:15 AM AKST
                </div>
                <div className="text-sm text-base-content/70 ml-6">
                  Passenger: <span className="font-medium">{incident.crewMemberName}</span>
                </div>
              </div>

              {/* Emergency button */}
              <button
                className="btn btn-error btn-lg w-full text-white font-bold text-base shadow-lg mb-3 animate-pulse"
                onClick={() => setStep('form')}
              >
                <AlertTriangle size={20} />
                I Need Emergency Help
              </button>
              <p className="text-xs text-center text-base-content/40">
                Flight issue? Medical emergency? Tap above for immediate assistance.
              </p>
            </>
          )}

          {step === 'form' && (
            <div className="flex-1 flex flex-col">
              <h3 className="font-bold text-sm mb-3">What happened?</h3>
              {/* Reason selector */}
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {reasonOptions.map(r => (
                  <button
                    key={r.code}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-xs transition-all ${
                      selectedReason === r.code
                        ? 'border-error bg-error/10 font-semibold'
                        : 'border-base-300 hover:border-base-content/30'
                    }`}
                    onClick={() => setSelectedReason(r.code)}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span className="leading-tight">{r.label}</span>
                  </button>
                ))}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 bg-base-200 rounded-lg p-2 mb-3">
                <MapPin size={14} className="text-success flex-shrink-0" />
                <div>
                  <div className="text-xs text-base-content/50">Detected Location</div>
                  <div className="text-sm font-medium">{incident.currentLocation}</div>
                </div>
              </div>

              {/* Description */}
              <textarea
                className="textarea textarea-bordered w-full text-sm mb-4"
                rows={3}
                defaultValue={incident.description}
                placeholder="Briefly describe what happened..."
              />

              <button
                className="btn btn-error w-full text-white font-bold mt-auto"
                onClick={() => setStep('submitted')}
              >
                <Send size={16} />
                Submit Emergency Request
              </button>
            </div>
          )}

          {step === 'submitted' && (
            <div className="flex-1 flex flex-col">
              {/* Confirmation */}
              <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center mb-4">
                <CheckCircle size={32} className="text-success mx-auto mb-2" />
                <h3 className="font-bold text-base text-success">Help is on the way</h3>
                <p className="text-sm text-base-content/70 mt-2">
                  Your coordinator has been notified. You'll receive an updated travel packet when your new flight is confirmed.
                </p>
                <div className="bg-error/10 border border-error/20 rounded-lg p-2 mt-3">
                  <p className="text-xs font-bold text-error">⚠ DO NOT book your own travel</p>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-base-200 rounded-xl p-3">
                <h4 className="font-bold text-xs text-base-content/60 uppercase tracking-wide mb-3">What happens next</h4>
                <div className="space-y-3">
                  {incident.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        i < 2 ? 'bg-success text-success-content' : i < 3 ? 'bg-info text-info-content' : 'bg-warning text-warning-content'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{t.event}</div>
                        <div className="text-xs text-base-content/50">{t.time} — {t.actor}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 items-start opacity-50">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-base-300 text-base-content/50">
                      5
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Updated travel packet sent to your phone</div>
                      <div className="text-xs text-base-content/50">Waiting...</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm mt-4"
                onClick={() => setStep('ready')}
              >
                ← Back to start
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Coordinator View (Dispatch Console) ──
const CoordinatorView: React.FC = () => {
  const [authorizedFlight, setAuthorizedFlight] = useState<number | null>(null);
  const incident = lifelineIncidents[0]; // Active incident

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-error/10 border border-error/20 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <Radio size={18} className="text-error animate-pulse" />
          <div>
            <div className="font-bold text-sm">Lifeline Coordinator Console</div>
            <div className="text-xs text-base-content/60">1 active incident • Last update: 4:44 AM AKST</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge badge-error badge-sm gap-1 animate-pulse">● LIVE</div>
        </div>
      </div>

      {/* On-duty info */}
      <div className="flex items-center gap-3 bg-base-200 rounded-lg p-3">
        <UserCheck size={16} className="text-primary" />
        <div className="flex-1">
          <div className="text-sm font-semibold">On-duty Coordinator: Sam Kelley — Logistics</div>
          <div className="text-xs text-base-content/50">Auto-routed based on schedule • Escalation: Sam → Kelly → Scott Keever → Eric Bardot</div>
        </div>
      </div>

      {/* Active incident card */}
      <div className="card bg-base-100 border-2 border-error/40 shadow-lg">
        <div className="card-body p-4">
          {/* Incident header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-error badge-sm gap-1"><AlertTriangle size={12} /> Lifeline</span>
                <span className={`badge ${statusColors[incident.status]} badge-sm`}>{incident.status.toUpperCase()}</span>
                <span className="badge badge-warning badge-sm">{incident.urgency}</span>
              </div>
              <h3 className="font-bold text-lg">{incident.crewMemberName}</h3>
              <div className="text-sm text-base-content/60">{incident.position} • ID: {incident.crewMemberId}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-base-content/50">Submitted</div>
              <div className="font-mono text-sm font-bold">4:42 AM</div>
              <div className="text-xs text-base-content/50">May 9, 2026</div>
            </div>
          </div>

          {/* Reason & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-base-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">Reason</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🧳</span>
                <div>
                  <div className="text-sm font-semibold">{incident.reasonLabel}</div>
                  <div className="text-xs text-base-content/60">{incident.description}</div>
                </div>
              </div>
            </div>
            <div className="bg-base-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">Current Location</div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-error" />
                <div>
                  <div className="text-sm font-semibold">{incident.currentLocation}</div>
                  <div className="text-xs text-base-content/60">At terminal, waiting for instructions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Original flight */}
          <div className="bg-error/5 border border-error/20 rounded-lg p-3 mb-4">
            <div className="text-xs font-semibold text-error uppercase tracking-wide mb-2 flex items-center gap-1">
              <XCircle size={12} /> Missed Flight
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane size={16} className="text-base-content/40" />
                <div>
                  <span className="font-semibold text-sm line-through">{incident.originalFlight.airline} {incident.originalFlight.flight}</span>
                  <div className="text-xs text-base-content/50">{incident.originalFlight.route} • Departed 6:15 AM</div>
                </div>
              </div>
              <div className="font-mono text-sm text-base-content/50">{formatCurrency(incident.originalFlight.cost)}</div>
            </div>
          </div>

          {/* Alternative flights */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Plane size={12} /> Alternative Flights — Select to Authorize
            </div>
            <div className="space-y-2">
              {incident.alternativeFlights?.map((alt, i) => (
                <div
                  key={i}
                  className={`border rounded-lg p-3 transition-all ${
                    authorizedFlight === i
                      ? 'border-success bg-success/10'
                      : 'border-base-300 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Plane size={16} className={authorizedFlight === i ? 'text-success' : 'text-primary'} />
                      <div>
                        <div className="font-semibold text-sm">{alt.airline} {alt.flight}</div>
                        <div className="text-xs text-base-content/60">
                          {alt.route} • Departs {new Date(alt.departTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Anchorage' })} → Arrives {new Date(alt.arriveTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Anchorage' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{formatCurrency(alt.cost)}</div>
                        <div className={`text-xs font-semibold ${
                          alt.costDelta === 0 ? 'text-success' : 'text-warning'
                        }`}>
                          {alt.costDelta === 0 ? 'No extra cost' : `+${formatCurrency(alt.costDelta)}`}
                        </div>
                      </div>
                      {authorizedFlight === i ? (
                        <div className="badge badge-success gap-1">
                          <CheckCircle size={12} /> Authorized
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setAuthorizedFlight(i)}
                        >
                          Authorize
                        </button>
                      )}
                    </div>
                  </div>
                  {alt.route.includes('SEA') && (
                    <div className="text-xs text-warning mt-1 ml-7">⚠ Routing via Seattle — 8hr travel time</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Post-authorization status */}
          {authorizedFlight !== null && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-success" />
                <span className="font-bold text-sm text-success">Flight Authorized — Actions Completed</span>
              </div>
              <div className="space-y-1 text-xs text-base-content/70 ml-6">
                <div>✅ {incident.alternativeFlights![authorizedFlight].airline} {incident.alternativeFlights![authorizedFlight].flight} booked for Marcus Webb</div>
                <div>✅ Updated travel packet pushed to crew member's phone</div>
                <div>✅ Cost event logged: +{formatCurrency(incident.alternativeFlights![authorizedFlight].costDelta)} rebooking delta</div>
                <div>✅ Vessel notified (outcome only)</div>
              </div>
            </div>
          )}

          {/* Vessel notification callout */}
          <div className="bg-info/10 border border-info/30 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-info" />
              <span className="font-bold text-xs text-info uppercase tracking-wide">Captain Isolation Protocol</span>
            </div>
            <p className="text-sm text-base-content/70">
              Captain Wilson was <span className="font-bold text-error">NOT notified</span> of incident details. Vessel received only:
            </p>
            <div className="bg-base-200 rounded p-2 mt-2 font-mono text-xs text-base-content/60 italic">
              "{incident.vesselNotification}"
            </div>
            <p className="text-xs text-base-content/50 mt-2 flex items-center gap-1">
              <Shield size={10} /> STCW rest compliance maintained — no captain wake-up required
            </p>
          </div>

          {/* Timeline */}
          <div>
            <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Clock size={12} /> Incident Timeline
            </div>
            <div className="space-y-2">
              {incident.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-error' : 'bg-primary'}`} />
                    {i < incident.timeline.length - 1 && <div className="w-px h-5 bg-base-300" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="text-xs font-semibold">{t.event}</div>
                    <div className="text-xs text-base-content/40">{t.time} — {t.actor}</div>
                  </div>
                </div>
              ))}
              {authorizedFlight !== null && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <div className="w-px h-5 bg-base-300" />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-xs font-semibold">{incident.alternativeFlights![authorizedFlight].flight} authorized by Sam Kelley (+{formatCurrency(incident.alternativeFlights![authorizedFlight].costDelta)})</div>
                      <div className="text-xs text-base-content/40">Just now — Sam Kelley</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-xs font-semibold">Updated travel packet sent to Marcus Webb</div>
                      <div className="text-xs text-base-content/40">Just now — System</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Accountability View (HR/Ops Dashboard) ──
const AccountabilityView: React.FC = () => {
  const allIncidents = lifelineIncidents;
  const records = lifelineCrewRecords;

  const totalCost = allIncidents.reduce((sum, i) => sum + i.costImpact, 0);
  const crewFaultCost = allIncidents.filter(i => i.faultType === 'crew_fault' && i.status === 'resolved').reduce((sum, i) => sum + i.costImpact, 0);
  const airlineFaultCost = allIncidents.filter(i => i.faultType === 'airline_fault').reduce((sum, i) => sum + i.costImpact, 0);
  const totalIncidentCount = allIncidents.length;
  const alertRecords = records.filter(r => r.patternAlert);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat bg-base-200 rounded-xl p-3">
          <div className="stat-title text-xs">Total Incidents</div>
          <div className="stat-value text-2xl">{totalIncidentCount}</div>
          <div className="stat-desc text-xs">Last 6 months</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-3">
          <div className="stat-title text-xs">Crew Fault</div>
          <div className="stat-value text-2xl text-error">{allIncidents.filter(i => i.faultType === 'crew_fault').length}</div>
          <div className="stat-desc text-xs">Preventable incidents</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-3">
          <div className="stat-title text-xs">Total Cost Impact</div>
          <div className="stat-value text-2xl">{formatCurrency(totalCost + 580)}</div>
          <div className="stat-desc text-xs">Emergency rebooking costs</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-3">
          <div className="stat-title text-xs">Pattern Alerts</div>
          <div className="stat-value text-2xl text-warning">{alertRecords.length}</div>
          <div className="stat-desc text-xs">Crew flagged for review</div>
        </div>
      </div>

      {/* Fleet incident log */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-primary" />
            Fleet Incident Log
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs">
                  <th>Date</th>
                  <th>Crew</th>
                  <th>Reason</th>
                  <th>Fault</th>
                  <th>Cost Impact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Jake's earlier incident (from records, not in detailed incidents array) */}
                <tr>
                  <td className="text-xs font-mono">2026-03-02</td>
                  <td className="text-sm font-medium">Jake Neilson</td>
                  <td><span className="badge badge-ghost badge-sm">Overslept</span></td>
                  <td><span className="badge badge-error badge-sm">Crew Fault</span></td>
                  <td className="font-mono text-sm text-error">+$240</td>
                  <td><span className="badge badge-success badge-sm">Resolved</span></td>
                </tr>
                {allIncidents.slice().reverse().map(incident => (
                  <tr key={incident.id}>
                    <td className="text-xs font-mono">{incident.timestamp.split('T')[0]}</td>
                    <td className="text-sm font-medium">{incident.crewMemberName}</td>
                    <td><span className="badge badge-ghost badge-sm">{incident.reasonLabel.replace('Missed Flight — ', '')}</span></td>
                    <td><span className={`badge ${faultColors[incident.faultType]} badge-sm`}>{faultLabels[incident.faultType]}</span></td>
                    <td className="font-mono text-sm">
                      {incident.costImpact > 0 ? (
                        <span className="text-error">+{formatCurrency(incident.costImpact)}</span>
                      ) : incident.status === 'reviewing' ? (
                        <span className="text-base-content/40">Pending</span>
                      ) : (
                        formatCurrency(incident.costImpact)
                      )}
                    </td>
                    <td><span className={`badge ${statusColors[incident.status]} badge-sm`}>{incident.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pattern alerts */}
      {alertRecords.length > 0 && (
        <div className="card bg-warning/10 border border-warning/30">
          <div className="card-body p-4">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-warning" />
              Pattern Alerts — Crew Flagged for Review
            </h3>
            <div className="space-y-3">
              {alertRecords.map(record => (
                <div key={record.crewMemberId} className="bg-base-100 border border-warning/30 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm">{record.crewMemberName}</div>
                      <div className="text-xs text-base-content/60 mt-1">
                        ⚠ {record.patternAlertMessage}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-error">{formatCurrency(record.totalCostImpact)}</div>
                      <div className="text-xs text-base-content/50">Total cost attributed</div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <BarChart3 size={12} />
                      {record.totalIncidents} total incidents
                    </div>
                    <div className="flex items-center gap-1 text-xs text-error">
                      <XCircle size={12} />
                      {record.crewFaultIncidents} crew-fault
                    </div>
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <Clock size={12} />
                      Last: {record.lastIncidentDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost attribution summary */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
            <DollarSign size={16} className="text-primary" />
            Cost Attribution Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-base-200 rounded-lg p-3 text-center">
              <div className="text-xs text-base-content/50 mb-1">Total Emergency Rebooking</div>
              <div className="text-xl font-bold">{formatCurrency(totalCost + 580)}</div>
            </div>
            <div className="bg-error/10 rounded-lg p-3 text-center">
              <div className="text-xs text-base-content/50 mb-1">Crew-Fault Cost</div>
              <div className="text-xl font-bold text-error">{formatCurrency(crewFaultCost + 580)}</div>
              <div className="text-xs text-base-content/40">Preventable losses</div>
            </div>
            <div className="bg-info/10 rounded-lg p-3 text-center">
              <div className="text-xs text-base-content/50 mb-1">Airline-Fault Cost</div>
              <div className="text-xl font-bold text-info">{formatCurrency(airlineFaultCost)}</div>
              <div className="text-xs text-base-content/40">Not crew responsibility</div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy config */}
      <div className="bg-base-200 rounded-xl p-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-base-content/50 mb-3 flex items-center gap-1">
          <Shield size={12} /> Escalation Policy Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <ChevronRight size={14} className="text-warning mt-0.5" />
            <div>
              <div className="font-semibold">Auto-Flag Threshold</div>
              <div className="text-xs text-base-content/60">After 2 crew-fault incidents in 180 days → auto-flag for HR review</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ChevronRight size={14} className="text-info mt-0.5" />
            <div>
              <div className="font-semibold">Coordinator Routing</div>
              <div className="text-xs text-base-content/60">Auto-route to on-duty coordinator — never the captain</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ChevronRight size={14} className="text-error mt-0.5" />
            <div>
              <div className="font-semibold">Vessel Notification</div>
              <div className="text-xs text-base-content/60">Outcome-only messages — no incident details sent to vessel</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ChevronRight size={14} className="text-success mt-0.5" />
            <div>
              <div className="font-semibold">Escalation Chain</div>
              <div className="text-xs text-base-content/60">Sam Kelley → Kelly → Scott Keever → Eric Bardot</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── AI Guardrails View ──
const GuardrailsView: React.FC = () => {
  const [maxAutoAuth, setMaxAutoAuth] = useState(500);
  const [maxAiRecommend, setMaxAiRecommend] = useState(1500);
  const [cleanWindow, setCleanWindow] = useState(90);
  const [patternThreshold, setPatternThreshold] = useState(2);
  const [airlineFaultAuto, setAirlineFaultAuto] = useState(true);
  const [stcwMinRest, setStcwMinRest] = useState(10);
  const [offHoursStart, setOffHoursStart] = useState('22:00');
  const [offHoursEnd, setOffHoursEnd] = useState('07:00');
  const [simStep, setSimStep] = useState(0);

  const incident = lifelineIncidents[0]; // Marcus Webb
  const costDelta = incident.alternativeFlights?.[0]?.costDelta ?? 180;

  // Determine which tier this incident falls into based on current settings
  const isCleanRecord = true; // Marcus has 0 prior crew-fault incidents
  const isSameRoute = true;
  const isAirlineFault = incident.faultType === 'airline_fault';
  const withinAutoLimit = costDelta <= maxAutoAuth;
  const withinAiLimit = costDelta <= maxAiRecommend;

  const autoTier = (isAirlineFault && airlineFaultAuto) ||
    (withinAutoLimit && isCleanRecord && isSameRoute)
    ? 'green' : withinAiLimit ? 'yellow' : 'red';

  const tierConfig = {
    green: { label: 'GREEN — Auto-Authorize', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: '🟢', desc: 'AI books immediately, no human involved' },
    yellow: { label: 'YELLOW — AI Recommends', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: '🟡', desc: 'AI picks best option, flags for morning review' },
    red: { label: 'RED — Human Escalation', color: 'text-error', bg: 'bg-error/10', border: 'border-error/30', icon: '🔴', desc: 'On-call coordinator contacted via SMS' },
  };

  const simTimeline = [
    { time: '4:42 AM', event: 'Marcus Webb submits Lifeline request', detail: 'Reason: Luggage Issue • Location: Juneau Airport Terminal', tier: 'input' },
    { time: '4:42 AM', event: 'AI evaluates against guardrails', detail: `Cost delta: +$${costDelta} • Clean record: ✅ • Same route: ✅ • Crew fault`, tier: 'eval' },
    { time: '4:42 AM', event: `Decision: ${tierConfig[autoTier].icon} ${tierConfig[autoTier].label}`, detail: autoTier === 'green' ? `+$${costDelta} is under $${maxAutoAuth} auto-authorize limit` : autoTier === 'yellow' ? `+$${costDelta} exceeds $${maxAutoAuth} auto limit but under $${maxAiRecommend} AI limit` : `+$${costDelta} exceeds $${maxAiRecommend} AI limit — escalating`, tier: autoTier },
    { time: '4:43 AM', event: autoTier === 'green' ? 'Alaska 67 booked automatically — no human contacted' : autoTier === 'yellow' ? 'Alaska 67 booked by AI — flagged for morning review' : 'SMS sent to Sam Kelley with 3 options — reply 1/2/3 to authorize', detail: autoTier !== 'red' ? 'C Teleport API → book → confirmation' : 'Escalation chain: Sam → Kelly → Scott → Eric', tier: 'action' },
    { time: '4:43 AM', event: 'Updated travel packet pushed to Marcus\'s phone', detail: 'New itinerary: Alaska 67, departs 10:27 AM AKST → BDA via SEA', tier: 'notify' },
    { time: '4:43 AM', event: 'Vessel notification: outcome only', detail: '"Marcus Webb rebooked on AS67, arriving BDA 10:27 PM. No action required."', tier: 'vessel' },
    { time: '7:00 AM', event: 'Morning digest sent to Sam Kelley', detail: '1 Lifeline incident overnight • Auto-resolved • Net cost: +$180 • No escalation needed', tier: 'digest' },
  ];

  const visibleSteps = simTimeline.slice(0, simStep + 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={20} className="text-primary" />
          <h3 className="font-bold text-lg">AI Authorization Guardrails</h3>
        </div>
        <p className="text-sm text-base-content/60">
          Configure when the system auto-authorizes emergency rebookings, when AI recommends options for morning review,
          and when to escalate to a human. Adjust the sliders below and watch how they affect real incident evaluation.
        </p>
      </div>

      {/* Tier overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['green', 'yellow', 'red'] as const).map(tier => (
          <div key={tier} className={`${tierConfig[tier].bg} border ${tierConfig[tier].border} rounded-xl p-3 ${autoTier === tier ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{tierConfig[tier].icon}</span>
              <span className={`font-bold text-sm ${tierConfig[tier].color}`}>{tierConfig[tier].label.split(' — ')[0]}</span>
            </div>
            <div className="font-semibold text-sm">{tierConfig[tier].label.split(' — ')[1]}</div>
            <div className="text-xs text-base-content/60 mt-1">{tierConfig[tier].desc}</div>
            {autoTier === tier && (
              <div className="badge badge-primary badge-sm mt-2 gap-1">← Marcus Webb's incident</div>
            )}
          </div>
        ))}
      </div>

      {/* Configuration panel */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
            <Shield size={16} className="text-primary" />
            Guardrail Configuration
            <span className="text-xs text-base-content/40 font-normal">— adjust and watch the simulation update</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost thresholds */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold flex items-center gap-1">
                    🟢 Auto-Authorize Ceiling
                  </label>
                  <span className="font-mono text-sm font-bold text-success">${maxAutoAuth}</span>
                </div>
                <input
                  type="range" min="0" max="2000" step="50" value={maxAutoAuth}
                  className="range range-success range-sm w-full"
                  onChange={e => setMaxAutoAuth(Number(e.target.value))}
                />
                <div className="text-xs text-base-content/50 mt-1">Rebookings under this amount are auto-approved — no human needed</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold flex items-center gap-1">
                    🟡 AI Recommendation Ceiling
                  </label>
                  <span className="font-mono text-sm font-bold text-warning">${maxAiRecommend}</span>
                </div>
                <input
                  type="range" min="500" max="5000" step="100" value={maxAiRecommend}
                  className="range range-warning range-sm w-full"
                  onChange={e => setMaxAiRecommend(Number(e.target.value))}
                />
                <div className="text-xs text-base-content/50 mt-1">Between auto and this ceiling: AI picks best option, logs for morning review</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold flex items-center gap-1">
                    ⏰ STCW Minimum Rest
                  </label>
                  <span className="font-mono text-sm font-bold">{stcwMinRest} hours</span>
                </div>
                <input
                  type="range" min="6" max="12" step="1" value={stcwMinRest}
                  className="range range-info range-sm w-full"
                  onChange={e => setStcwMinRest(Number(e.target.value))}
                />
                <div className="text-xs text-base-content/50 mt-1">AI ensures rebooked itinerary allows this rest period before first watch</div>
              </div>
            </div>

            {/* Behavior settings */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold flex items-center gap-1">
                    📅 Clean Record Window
                  </label>
                  <span className="font-mono text-sm font-bold">{cleanWindow} days</span>
                </div>
                <input
                  type="range" min="30" max="365" step="30" value={cleanWindow}
                  className="range range-sm w-full"
                  onChange={e => setCleanWindow(Number(e.target.value))}
                />
                <div className="text-xs text-base-content/50 mt-1">No crew-fault incidents within this window = eligible for auto-authorize</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold flex items-center gap-1">
                    🚩 Pattern Alert Threshold
                  </label>
                  <span className="font-mono text-sm font-bold">{patternThreshold} incidents</span>
                </div>
                <input
                  type="range" min="1" max="5" step="1" value={patternThreshold}
                  className="range range-error range-sm w-full"
                  onChange={e => setPatternThreshold(Number(e.target.value))}
                />
                <div className="text-xs text-base-content/50 mt-1">After this many crew-fault incidents → always escalate to human + HR flag</div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3 p-0">
                  <input
                    type="checkbox" checked={airlineFaultAuto}
                    className="toggle toggle-success toggle-sm"
                    onChange={e => setAirlineFaultAuto(e.target.checked)}
                  />
                  <div>
                    <span className="text-sm font-semibold">✈️ Airline-Fault Auto-Approve</span>
                    <div className="text-xs text-base-content/50">Cancellations, delays, and missed connections caused by the airline — always auto-approve regardless of cost</div>
                  </div>
                </label>
              </div>

              <div className="bg-base-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">Off-Hours Auto Mode</div>
                <div className="flex items-center gap-2">
                  <input type="time" value={offHoursStart} className="input input-bordered input-sm w-28 font-mono" onChange={e => setOffHoursStart(e.target.value)} />
                  <span className="text-sm text-base-content/50">to</span>
                  <input type="time" value={offHoursEnd} className="input input-bordered input-sm w-28 font-mono" onChange={e => setOffHoursEnd(e.target.value)} />
                </div>
                <div className="text-xs text-base-content/50 mt-1">During these hours, Green + Yellow tiers operate fully autonomous</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live simulation */}
      <div className="card bg-base-100 border-2 border-primary/30">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              Live Simulation — "Captain Wilson's 4 AM Email"
              <span className="text-xs text-base-content/40 font-normal">How today's scenario plays out with AI guardrails</span>
            </h3>
            <div className="flex items-center gap-2">
              {simStep > 0 && (
                <button className="btn btn-ghost btn-xs" onClick={() => setSimStep(0)}>
                  Reset
                </button>
              )}
              {simStep < simTimeline.length - 1 ? (
                <button className="btn btn-primary btn-sm gap-1" onClick={() => setSimStep(s => s + 1)}>
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <span className="badge badge-success gap-1"><CheckCircle size={12} /> Complete</span>
              )}
            </div>
          </div>

          {/* Simulation context */}
          <div className="bg-base-200 rounded-lg p-3 mb-4 text-sm">
            <span className="font-bold">Scenario:</span> It's 4:42 AM on a Saturday. Marcus Webb missed his flight in Juneau because his luggage broke and he had to replace it at Walmart.
            Captain Wilson is in mandatory rest. Kelly is asleep. Sam is moving into a new house.
            <span className="font-bold text-primary"> What happens?</span>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {visibleSteps.map((step, i) => {
              const tierColor = step.tier === 'green' ? 'bg-success' :
                step.tier === 'yellow' ? 'bg-warning' :
                step.tier === 'red' ? 'bg-error' :
                step.tier === 'eval' ? 'bg-info' :
                step.tier === 'input' ? 'bg-error' :
                step.tier === 'action' ? 'bg-primary' :
                step.tier === 'notify' ? 'bg-accent' :
                step.tier === 'vessel' ? 'bg-info' :
                'bg-success';

              return (
                <div key={i} className={`flex items-start gap-3 transition-all ${i === simStep ? 'scale-[1.01]' : 'opacity-80'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${tierColor} ${i === simStep ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                    {i < visibleSteps.length - 1 && <div className="w-px h-8 bg-base-300" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-base-content/40">{step.time}</span>
                      <span className="font-semibold text-sm">{step.event}</span>
                    </div>
                    <div className="text-xs text-base-content/60 mt-0.5">{step.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result callout */}
          {simStep >= simTimeline.length - 1 && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-success" />
                <span className="font-bold text-success">Resolved — Zero Phone Calls</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">0</div>
                  <div className="text-xs text-base-content/50">Phone calls made</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">61s</div>
                  <div className="text-xs text-base-content/50">Total resolution time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">+${costDelta}</div>
                  <div className="text-xs text-base-content/50">Cost delta (logged)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">3</div>
                  <div className="text-xs text-base-content/50">People who slept through it</div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-base-200 rounded-lg">
                <div className="text-xs text-base-content/50 mb-1">Compare to what actually happened today:</div>
                <div className="text-sm text-base-content/70">
                  Kelly woken at 4:40 AM → called Sam → Sam rebooking while moving → Captain Wilson sent formal complaint about STCW rest violations → unresolved for hours
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Morning digest preview */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
            <Bell size={16} className="text-primary" />
            Morning Digest Preview
            <span className="text-xs text-base-content/40 font-normal">What Sam sees at 7:00 AM instead of a 4:40 AM phone call</span>
          </h3>

          {/* Email-style digest */}
          <div className="bg-base-200 rounded-xl p-4 font-mono text-sm space-y-3">
            <div className="border-b border-base-300 pb-2 mb-2">
              <div className="text-xs text-base-content/50">From: Bender Boat System</div>
              <div className="text-xs text-base-content/50">To: Sam Kelley</div>
              <div className="text-xs text-base-content/50">Time: 7:00 AM EST</div>
              <div className="font-bold text-base-content mt-1">🛟 Lifeline Overnight Summary — May 9, 2026</div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="badge badge-success badge-sm">🟢 1 Auto-Resolved</span>
              <span className="badge badge-ghost badge-sm">🟡 0 AI-Recommended</span>
              <span className="badge badge-ghost badge-sm">🔴 0 Escalated</span>
            </div>

            <div className="border border-base-300 rounded-lg p-3 bg-base-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Marcus Webb — AB/Deckhand</span>
                <span className="badge badge-success badge-sm">Auto-Resolved</span>
              </div>
              <div className="text-xs space-y-1 text-base-content/70">
                <div>📍 Incident: 4:42 AM AKST at Juneau Airport</div>
                <div>📝 Reason: Luggage broke en route — replaced at Walmart, missed boarding</div>
                <div>❌ Missed: Alaska 42 (JNU→SEA→BDA) — $380</div>
                <div>✅ Rebooked: Alaska 67 (JNU→SEA→BDA) — $560 (+$180)</div>
                <div>⚖️ Classification: Crew Fault — 1st incident (no pattern flag)</div>
                <div>🛏️ STCW: {stcwMinRest}hr rest requirement met — watch eligible 8:27 AM next day</div>
                <div>🚢 Vessel notified: outcome only, captain not disturbed</div>
              </div>
            </div>

            <div className="text-xs text-base-content/40 pt-2 border-t border-base-300">
              Net overnight cost impact: +$180 • Total Lifeline costs this month: +$520 • Fleet pattern alerts: 1 (Jake Neilson)
            </div>
          </div>
        </div>
      </div>

      {/* AI decision factors */}
      <div className="bg-base-200 rounded-xl p-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-base-content/50 mb-3 flex items-center gap-1">
          <Shield size={12} /> How the AI Evaluates Each Request
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <DollarSign size={14} className="text-success mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Cost Delta</div>
              <div className="text-xs text-base-content/60">How much more than the original ticket? Under ${maxAutoAuth} → auto. Over ${maxAiRecommend} → human.</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Crew History</div>
              <div className="text-xs text-base-content/60">Clean record in last {cleanWindow} days? Green tier eligible. {patternThreshold}+ crew-fault incidents? Always Red.</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Plane size={14} className="text-info mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Fault Classification</div>
              <div className="text-xs text-base-content/60">Airline cancellation? {airlineFaultAuto ? 'Always auto-approve, no cost cap.' : 'Subject to same cost limits as crew-fault.'}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={14} className="text-warning mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Vessel Schedule</div>
              <div className="text-xs text-base-content/60">Will the crew member make the crew change window? If not → escalate regardless of cost.</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-error mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">STCW Rest</div>
              <div className="text-xs text-base-content/60">New itinerary must allow {stcwMinRest}hr rest before first watch. AI filters out options that violate this.</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <BarChart3 size={14} className="text-accent mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Route Analysis</div>
              <div className="text-xs text-base-content/60">Same origin/destination? Green eligible. Different routing needed? Yellow at minimum.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Lifeline Portal Component ──
export const LifelinePortal: React.FC = () => {
  const [activeView, setActiveView] = useState<LifelineView>('crew');

  const views: { id: LifelineView; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'crew', label: 'Crew Portal', icon: <Smartphone size={16} />, desc: 'What crew sees on their phone' },
    { id: 'coordinator', label: 'Coordinator', icon: <Headphones size={16} />, desc: 'Authorization dashboard' },
    { id: 'accountability', label: 'Accountability', icon: <BarChart3 size={16} />, desc: 'Pattern tracking & costs' },
    { id: 'guardrails', label: 'AI Guardrails', icon: <Shield size={16} />, desc: 'Auto-authorize rules' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle size={20} className="text-error" />
            Lifeline — Emergency Travel Response
          </h2>
          <p className="text-sm text-base-content/60 mt-1">24/7 automated crew travel hotline • No phone calls • No captain wake-ups</p>
        </div>
        <div className="badge badge-error gap-1 animate-pulse">
          <Radio size={12} /> 1 Active
        </div>
      </div>

      {/* View selector */}
      <div className="flex gap-2">
        {views.map(v => (
          <button
            key={v.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === v.id
                ? 'bg-primary text-primary-content shadow-md'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
            onClick={() => setActiveView(v.id)}
          >
            {v.icon}
            <div className="text-left">
              <div>{v.label}</div>
              <div className={`text-xs ${activeView === v.id ? 'text-primary-content/70' : 'text-base-content/40'}`}>{v.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* View content */}
      {activeView === 'crew' && <CrewPortalView />}
      {activeView === 'coordinator' && <CoordinatorView />}
      {activeView === 'accountability' && <AccountabilityView />}
      {activeView === 'guardrails' && <GuardrailsView />}
    </div>
  );
};

export default LifelinePortal;
