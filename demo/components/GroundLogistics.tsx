import React, { useState } from 'react';
import { MapPin, Clock, Hotel, Car, Users, AlertTriangle, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { CrewLogisticsPlan, LogisticsTag } from '../types';
import { crewLogisticsPlans } from '../data';

function TagBadge({ tag }: { key?: string; tag: LogisticsTag }) {
  const colorMap: Record<string, string> = {
    traveling_together: 'badge-info',
    first_arrival: 'badge-warning',
    rental_vehicle: 'badge-success',
    rider: 'badge-success badge-outline',
    rest_required: 'badge-error',
    heavy_gear: 'badge-neutral',
    inter_vessel: 'badge-primary',
    comms_needed: 'badge-warning',
    return_booked: 'badge-ghost',
    priority_arrival: 'badge-secondary',
  };
  return (
    <div className="tooltip tooltip-bottom" data-tip={tag.detail || tag.label}>
      <span className={`badge badge-sm gap-1 ${colorMap[tag.type] || 'badge-ghost'}`}>
        <span>{tag.icon}</span>
        <span>{tag.label}</span>
      </span>
    </div>
  );
}

function CrewLogisticsCard({ plan, index }: { key?: string; plan: CrewLogisticsPlan; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="card bg-base-100 border border-base-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setExpanded(!expanded)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="card-body p-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-content font-bold text-sm">
              {plan.pickupSequence === 0 ? '★' : plan.pickupSequence}
            </div>
            <div>
              <h3 className="font-bold text-sm">{plan.crewMemberName}</h3>
              <p className="text-xs opacity-60">{plan.position}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono opacity-70">
              Arrives {new Date(plan.arrivalTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ {new Date(plan.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {plan.tags.map((tag, i) => (
            <TagBadge key={`${plan.crewMemberId}-tag-${i}`} tag={tag} />
          ))}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 space-y-3 border-t border-base-200 pt-3">
            {/* Hotel */}
            {plan.hotel && (
              <div className="flex items-start gap-2">
                <Hotel size={14} className="text-info mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">{plan.hotel.hotelName}</span>
                  <span className="opacity-60"> — {plan.hotel.address}</span>
                  <div className="flex gap-3 mt-1 opacity-70">
                    <span>Conf: {plan.hotel.confirmationNumber}</span>
                    <span>In: {plan.hotel.checkIn}</span>
                    <span>Out: {plan.hotel.checkOut}</span>
                    <span>${plan.hotel.nightlyRate}/night</span>
                  </div>
                  {plan.hotel.notes && <div className="mt-1 opacity-60 italic">{plan.hotel.notes}</div>}
                </div>
              </div>
            )}

            {/* Ground Transport */}
            {plan.groundTransport && (
              <div className="flex items-start gap-2">
                <Car size={14} className="text-success mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold capitalize">{plan.groundTransport.type.replace('_', ' ')}</span>
                  {plan.groundTransport.provider && <span> — {plan.groundTransport.provider}</span>}
                  {plan.groundTransport.confirmationNumber && <span className="opacity-60"> ({plan.groundTransport.confirmationNumber})</span>}
                  <div className="mt-1 opacity-70">
                    <span>{plan.groundTransport.pickupLocation}</span>
                    <span className="mx-1">→</span>
                    <span>{plan.groundTransport.dropoffLocation}</span>
                  </div>
                  <div className="flex gap-3 mt-1 opacity-70">
                    <span>Pickup: {new Date(plan.groundTransport.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    {plan.groundTransport.cost > 0 && <span>${plan.groundTransport.cost}</span>}
                    {plan.groundTransport.capacity && <span>Capacity: {plan.groundTransport.capacity}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Watch Eligibility */}
            {plan.watchEligibleTime && (
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-warning mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">Watch eligible:</span>
                  <span className="ml-1">
                    {new Date(plan.watchEligibleTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @{' '}
                    {new Date(plan.watchEligibleTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="opacity-60 ml-1">(STCW minimum rest)</span>
                </div>
              </div>
            )}

            {/* Notes */}
            {plan.notes && (
              <div className="flex items-start gap-2">
                <Navigation size={14} className="text-secondary mt-0.5 shrink-0" />
                <p className="text-xs opacity-70 italic">{plan.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GroundLogistics() {
  const plans = crewLogisticsPlans;
  const sorted = [...plans].sort((a, b) => a.pickupSequence - b.pickupSequence);

  // Summary stats
  const totalHotelCost = plans.reduce((sum, p) => sum + (p.hotel?.nightlyRate || 0), 0);
  const totalTransportCost = plans.reduce((sum, p) => sum + (p.groundTransport?.cost || 0), 0);
  const restRequired = plans.filter(p => p.tags.some(t => t.type === 'rest_required'));
  const firstTimers = plans.filter(p => p.tags.some(t => t.type === 'first_arrival'));
  const uniqueHotels = [...new Set(plans.filter(p => p.hotel).map(p => p.hotel!.hotelName))];

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Crew Arriving</div>
          <div className="stat-value text-lg">{plans.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Hotels</div>
          <div className="stat-value text-lg">{uniqueHotels.length}</div>
          <div className="stat-desc text-xs">${totalHotelCost}/night total</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Transport Cost</div>
          <div className="stat-value text-lg">${totalTransportCost}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Rest Required</div>
          <div className="stat-value text-lg text-warning">{restRequired.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">First-Timers</div>
          <div className="stat-value text-lg text-info">{firstTimers.length}</div>
        </div>
      </div>

      {/* Pickup timeline */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            Pickup Sequence — Norfolk Crew Change
          </h3>
          <div className="overflow-x-auto mt-2">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Crew</th>
                  <th>Arrives</th>
                  <th>Hotel</th>
                  <th>Transport</th>
                  <th>To Pier</th>
                  <th>Watch Eligible</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((plan) => (
                  <tr key={plan.crewMemberId}>
                    <td className="font-bold">{plan.pickupSequence === 0 ? '★' : plan.pickupSequence}</td>
                    <td>
                      <div className="font-semibold">{plan.crewMemberName}</div>
                      <div className="text-xs opacity-60">{plan.position}</div>
                    </td>
                    <td className="font-mono text-xs">
                      {new Date(plan.arrivalTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br />
                      {new Date(plan.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="text-xs">{plan.hotel?.hotelName?.replace('Norfolk Naval Station', '').replace('Norfolk Waterside', '').trim() || '—'}</td>
                    <td className="text-xs capitalize">{plan.groundTransport?.type.replace('_', ' ') || '—'}</td>
                    <td className="font-mono text-xs">
                      {plan.groundTransport ? new Date(plan.groundTransport.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="font-mono text-xs">
                      {plan.watchEligibleTime ? (
                        <>
                          {new Date(plan.watchEligibleTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                          {new Date(plan.watchEligibleTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {plan.tags.filter(t => ['first_arrival', 'rest_required', 'priority_arrival', 'heavy_gear', 'comms_needed', 'inter_vessel'].includes(t.type)).map((tag, i) => (
                          <span key={`${plan.crewMemberId}-flag-${i}`} className="tooltip" data-tip={tag.detail}>
                            <span className="text-sm">{tag.icon}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hotel grouping */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Hotel size={14} className="text-info" />
            Hotel Assignments — Routing Groups
          </h3>
          <div className="space-y-3 mt-2">
            {uniqueHotels.map(hotel => {
              const crewAtHotel = plans.filter(p => p.hotel?.hotelName === hotel);
              return (
                <div key={hotel} className="bg-base-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{hotel}</span>
                      <span className="text-xs opacity-60 ml-2">{crewAtHotel[0]?.hotel?.address}</span>
                    </div>
                    <div className="badge badge-sm">{crewAtHotel.length} crew</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {crewAtHotel.map(c => (
                      <div key={c.crewMemberId} className="flex items-center gap-1 bg-base-100 rounded px-2 py-1 text-xs">
                        <Users size={10} />
                        <span className="font-semibold">{c.crewMemberName}</span>
                        <span className="opacity-60">({c.hotel?.confirmationNumber})</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    ${crewAtHotel[0]?.hotel?.nightlyRate}/night × {crewAtHotel.length} rooms = ${(crewAtHotel[0]?.hotel?.nightlyRate || 0) * crewAtHotel.length}/night
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual cards */}
      <h3 className="font-bold text-sm flex items-center gap-2 pt-2">
        <Users size={14} /> Crew Detail Cards
        <span className="text-xs opacity-60 font-normal">(click to expand)</span>
      </h3>
      <div className="space-y-2">
        {sorted.map((plan, i) => (
          <CrewLogisticsCard key={plan.crewMemberId} plan={plan} index={i} />
        ))}
      </div>
    </div>
  );
}